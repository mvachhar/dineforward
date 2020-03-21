import Adapt, {
    AdaptElement,
    BuildHelpers,
    childrenToArray,
    DeferredComponent,
    Group,
} from "@adpt/core";
import { ContainerProps, isContainerElement, PortBinding } from "@adpt/cloud";
import {
    isNetworkServiceElement,
    NetworkService,
    NetworkServiceProps,
    ServicePort
} from "@adpt/cloud";
import { ServiceProps } from "@adpt/cloud";
import { CloudRunContainer, CloudRunContainerProps } from "./CloudRunContainer";
import { CloudRunNetworkService } from "./CloudRunNetworkService";

/**
 * Props for {@link docker.ServiceContainerSet}
 *
 * @public
 */
export interface CloudRunServiceContainerSetProps extends ServiceProps {
    /**
     * Props to apply to all {@link gcloud.CloudRunContainer}s within this
     * ServiceContainerSet. If a prop is specified in the source {@link Container}
     * component and in `runProps`, `runProps` will take
     * precedence.
     */
    runProps?: Partial<CloudRunContainerProps>;
}

function mapContainer(absEl: AdaptElement<ContainerProps>,
    spProps: CloudRunServiceContainerSetProps, helpers: BuildHelpers,
    portBindings: PortBinding | undefined) {
    const { runProps = {} } = spProps;
    const { handle: _h, ...absProps } = absEl.props;
    const finalProps = {
        ...absProps,
        ...runProps,
        key: absEl.props.key,
    };

    // Add the port bindings from the NetworkServices
    if (portBindings) {
        finalProps.portBindings = {
            ...(finalProps.portBindings || {}),
            ...portBindings,
        };
    }

    const ctr = <CloudRunContainer {...finalProps} />;
    absEl.props.handle.replaceTarget(ctr, helpers);
    return ctr;
}

function mapNetworkService(absEl: AdaptElement<NetworkServiceProps>,
    _props: CloudRunServiceContainerSetProps, helpers: BuildHelpers) {
    const { handle: _h, ...props } = absEl.props;
    const svc = <CloudRunNetworkService {...props} />;
    absEl.props.handle.replaceTarget(svc, helpers);
    return svc;
}

/**
 * Record which NetworkService elements expose a service with external
 * scope and record the port binding associated with the endpoint element.
 * @internal
 */
function getPortBindings(elems: CloudRunServiceContainerSetProps["children"]) {
    const portMap = new Map<AdaptElement, PortBinding>();
    const getPorts = (el: AdaptElement) => {
        let ret = portMap.get(el);
        if (!ret) {
            ret = {};
            portMap.set(el, ret);
        }
        return ret;
    };
    const toPortNum = (p: ServicePort) => {
        const pNum = Number(p);
        if (isNaN(pNum) || !Number.isInteger(pNum) || pNum <= 0 || pNum >= 65536) {
            throw new Error(`Network service port ${p} is not a valid number`);
        }
        return pNum;
    };

    for (const el of elems) {
        if (!isNetworkServiceElement(el) || el.props.scope !== "external") {
            continue;
        }
        const endpoint = el.props.endpoint && el.props.endpoint.target;
        if (!endpoint) continue;
        const ports = getPorts(endpoint);
        const proto = el.props.protocol || NetworkService.defaultProps.protocol;
        const ctrPort = el.props.targetPort || el.props.port;
        const hostPort = toPortNum(el.props.port);
        ports[`${ctrPort}/${proto.toLowerCase()}`] = hostPort;
    }

    return portMap;
}

/**
 * A component for mapping a group of abstract {@link Container}s and
 * {@link NetworkService}s to CloudRun {@link gcloud.CloudRunContainer | CloudRunContainer}s
 * and {@link gcloud.CloudRunNetworkService}s.
 *
 * @remarks
 * This component is intended to be used to replace {@link Container} and
 * {@link NetworkService} components that are grouped together, as the
 * only children of a common parent in a pattern that looks like this:
 * ```tsx
 * <Service>
 *   <Container ... />
 *   <Container ... />
 *   <NetworkService ... />
 * </Service>
 * ```
 * `CloudRunServiceContainerSet` maps those abstract components into Docker components
 * like this:
 * ```tsx
 * <Group>
 *   <gcloud.CloudRunContainer ... >
 *   <gcloud.CloudRunContainer ... >
 *   <gcloud.CloudRunNetworkService ... >
 * </Group>
 * ```
 * An example style rule to do this is:
 * ```tsx
 * {Service}
 * {Adapt.rule((matchedProps) => {
 *     const { handle, ...remainingProps } = matchedProps;
 *     return <CloudRunServiceContainerSet {...remainingProps} />;
 * })}
 * ```
 *
 * Currently, {@link gcloud.CloudRunNetworkService} implements the {@link NetworkServiceInstance}
 * interface, but does not deploy a network proxy component. So the CloudRun
 * ServiceContainerSet component applies the network port configuration specified by
 * the {@link NetworkService}s to their target
 * {@link gcloud.CloudRunContainer | CloudRunContainer}s.
 *
 * @public
 */
export class CloudRunServiceContainerSet extends DeferredComponent<CloudRunServiceContainerSetProps> {
    build(helpers: BuildHelpers) {
        const children = childrenToArray(this.props.children);

        const portMap = getPortBindings(children);

        const mappedChildren = children.map((c) => {
            if (isContainerElement(c)) {
                return mapContainer(c, this.props, helpers, portMap.get(c));
            }
            if (isNetworkServiceElement(c)) {
                return mapNetworkService(c, this.props, helpers);
            }
            return c;
        });

        return <Group key={this.props.key}>{mappedChildren}</Group>;
    }
}
