import Adapt, {
    Group,
    handle,
    Handle,
    SFCDeclProps,
    SFCBuildProps,
    Sequence,
    useImperativeMethods,
    callInstanceMethod,
    useMethodFrom
} from "@adpt/core";
import { dockerDevStyle, prodStyle } from "./styles";
import {
    mergeEnvPairs,
    Environment,
    useConnectTo,
    updateEnvVars,
    NetworkScope,
    NetworkService,
    NetworkServiceScope,
    Service,
    Container,
    ConnectToInstance,
    lookupEnvVar,
    mergeEnvSimple
} from "@adpt/cloud";
import { MongoDB } from "@adpt/cloud/mongodb";
import { LocalDockerImage } from "@adpt/cloud/dist/src/docker";
import { readFileSync } from "fs";
import { Redis } from "@adpt/cloud/redis";
import { URL } from "url";
import { Cloudinary, GoogleMaps } from "./lib";
import { CloudRun } from "./gcloud";
import { CloudRunAdapter } from "./gcloud/CloudRun";

interface DfApiProps {
    port: number;
    mongo: Handle;
    redis: Handle;
    cloudinary: Handle;
    googleMaps: Handle;
    scope: NetworkServiceScope;
    cloudRunHack?: boolean;
}

const dfApiDefaultProps = {
    port: 80,
    scope: "external",
    cloudRunHack: false
}

function createEnvVars(e: Environment): Environment {
    const env = updateEnvVars(e, (name, value) => {
        switch (name) {
            case "MONGODB_URI": return { name: "MONGO_URI", value: value }
            default: return { name, value }
        }
    });

    const redisURI = lookupEnvVar(env, "REDIS_URI");
    if (!redisURI) return env;

    const redisInfo = new URL(redisURI);
    return mergeEnvSimple(env, {
        REDIS_PASSWORD: redisInfo.password || redisInfo.searchParams.get("password") || "",
        REDIS_DBNAME: redisInfo.pathname.substr(1) || redisInfo.searchParams.get("db") || "",
        REDIS_HOST: redisInfo.hostname,
        REDIS_ENDPOINT: redisInfo.host,
        REDIS_PORT: redisInfo.port,
    }) || env;
}

function DfApi(props: SFCDeclProps<DfApiProps>) {
    const { mongo, redis, cloudinary, googleMaps, port, scope, cloudRunHack } =
        props as SFCBuildProps<DfApiProps, typeof dfApiDefaultProps>;

    const connections = useConnectTo(
        [mongo, redis, cloudinary, googleMaps],
        createEnvVars);

    const env = mergeEnvPairs(connections, {
        API_PORT: port.toString(),
    });

    const img = handle();
    const netSvc = handle();
    const nodeCtr = handle();

    useMethodFrom(netSvc, "hostname");
    useMethodFrom(netSvc, "port");
    useImperativeMethods<ConnectToInstance>(() => ({
        connectEnv: (): Environment => {
            const hostname = callInstanceMethod<string | undefined>(netSvc, undefined, "hostname", NetworkScope.external);
            const port = callInstanceMethod<string | undefined>(netSvc, undefined, "port");
            if (!(hostname && port)) {
                console.log("No DFAPI hostname or port");
                return {};
            }
            const uri = `http://${hostname}:${port}`;
            console.log("DF URI:", uri);
            return {
                DF_API_URI: uri
            };
        }
    }));

    return <Sequence>
        <LocalDockerImage key={props.key + "-img"} handle={img}
            dockerfile={readFileSync("../Dockerfile").toString()}
            contextDir={".."}
            options={{
                imageName: "dineforward-api",
                uniqueTag: true,
                //FIXME(manishv) we should probably sanitize env
                // to avoid secrets accidentally ending up in the image
                // even thought they aren't required for build.
                // AFAIK, cloudinary vars are the only thing required.
                buildArgs: env
            }} />
        {mongo}
        {cloudRunHack
            ? <CloudRunAdapter
                region={"us-west1"}
                port={port} image={img}
                registryUrl={"gcr.io/thisprojectdoesnotexist"} />
            : <Service>
                <NetworkService
                    key={props.key + "-netsvc"}
                    handle={netSvc}
                    endpoint={nodeCtr}
                    port={port}
                    targetPort={80}
                    scope={scope}
                />
                <Container
                    key={props.key}
                    name="node-service"
                    handle={nodeCtr}
                    environment={env}
                    image={img}
                    ports={[80]}
                    imagePullPolicy="IfNotPresent"
                />
            </Service>}
    </Sequence >
}
DfApi.defaultProps = dfApiDefaultProps;

function App(props: { cloudRunHack?: boolean }) {
    const mongo = handle();
    const api = handle();
    const redis = handle();
    const cloudinary = handle();
    const googleMaps = handle();

    return <Group key="App">
        <MongoDB handle={mongo} />
        <Redis handle={redis} />
        <Cloudinary handle={cloudinary} />
        <GoogleMaps handle={googleMaps} />
        <DfApi handle={api} port={8080}
            mongo={mongo}
            redis={redis}
            cloudinary={cloudinary}
            googleMaps={googleMaps}
            cloudRunHack={props.cloudRunHack} />
    </Group>;
}

Adapt.stack("default", <App />, dockerDevStyle);
Adapt.stack("local-dev", <App />, dockerDevStyle);
//cloudRunHack={true} is a temporary workaround because there is no abstract
//cloud.Service component that renders to gcloud.CloudRun isntances
Adapt.stack("gcloud-prod", <App cloudRunHack={true} />, prodStyle);

// Testing environments for complex components, should be 
// factored out into separate package with CI and tests
Adapt.stack("gcloudrun-raw-test", <CloudRun region="us-west1" port={5678} image="gcr.io/adaptjs-demo-project/http-echo" args={{ "-text": "foo" }} />);
