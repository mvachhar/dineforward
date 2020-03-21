import { ContainerProps } from "@adpt/cloud";
/**
 * Container component compatible with the {@link Container} interface.
 * 
 * @remarks
 * 
 * Primarily used by {@link gcloud.CloudRunServiceContainerSet} to provide a 
 * {@link Container} compatible shim to {@link gcloud.CloudRun}
 */
export function CloudRunContainer(props: ContainerProps) {
    return null;
}

export interface CloudRunContainerProps {}
