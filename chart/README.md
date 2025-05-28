# Puttable Helm Chart

This Helm chart deploys the Puttable application on a Kubernetes cluster.

## Prerequisites

- Kubernetes 1.12+
- Helm 3.0+

## Installing the Chart

To install the chart with the release name `my-puttable`:

```bash
helm install my-puttable ./chart
```

The command deploys Puttable on the Kubernetes cluster with default configuration. The [Parameters](#parameters) section lists the parameters that can be configured during installation.

## Uninstalling the Chart

To uninstall/delete the `my-puttable` deployment:

```bash
helm delete my-puttable
```

## Parameters

The following table lists the configurable parameters of the Puttable chart and their default values.

| Parameter                                  | Description                                      | Default                                                 |
|-------------------------------------------|--------------------------------------------------|--------------------------------------------------------|
| `replicaCount`                            | Number of replicas                               | `1`                                                     |
| `image.repository`                        | Image repository                                 | `puttable`                                              |
| `image.tag`                               | Image tag                                        | `latest`                                                |
| `image.pullPolicy`                        | Image pull policy                                | `IfNotPresent`                                          |
| `service.type`                            | Kubernetes Service type                          | `ClusterIP`                                             |
| `service.port`                            | Service HTTP port                                | `80`                                                    |
| `service.targetPort`                      | Port in container to expose                      | `3000`                                                  |
| `ingress.enabled`                         | Enable ingress controller resource               | `false`                                                 |
| `ingress.className`                       | IngressClass that will be be used                | `""`                                                    |
| `ingress.annotations`                     | Ingress annotations                              | `{}`                                                    |
| `ingress.hosts[0].host`                   | Hostname to your Puttable installation           | `chart-example.local`                                   |
| `ingress.hosts[0].paths[0].path`          | Path within the host                             | `/`                                                     |
| `ingress.hosts[0].paths[0].pathType`      | Ingress path type                                | `ImplementationSpecific`                                |
| `ingress.tls`                             | TLS configuration for ingress                    | `[]`                                                    |
| `puttable.baseUrl`                        | Base URL for the Puttable application            | `""`                                                    |
| `puttable.supabase.url`                   | Supabase URL                                     | `"supabase-url"`                                        |
| `puttable.supabase.apiKey.value`          | Supabase API key value (plain text)              | `""`                                                    |
| `puttable.supabase.apiKey.secret.secretName` | Name of the secret containing the Supabase API key | `""`                                                |
| `puttable.supabase.apiKey.secret.secretKey` | Key in the secret for the Supabase API key     | `""`                                                    |
| `puttable.keycloak.clientId`              | Keycloak client ID                               | `""`                                                    |
| `puttable.keycloak.clientSecret.value`    | Keycloak client secret value (plain text)        | `""`                                                    |
| `puttable.keycloak.clientSecret.secret.secretName` | Name of the secret containing the Keycloak client secret | `""`                                  |
| `puttable.keycloak.clientSecret.secret.secretKey` | Key in the secret for the Keycloak client secret | `""`                                           |
| `puttable.keycloak.redirectUri`           | Keycloak redirect URI                            | `""`                                                    |
| `puttable.keycloak.realmUrl`              | Keycloak realm URL                               | `""`                                                    |
| `env.HOST`                                | Host to bind to                                  | `"0.0.0.0"`                                             |
| `env.CHECK_ORIGIN`                        | Whether to check origin                          | `"true"`                                                |
| `env.NODE_ENV`                            | Node environment                                 | `"production"`                                          |
| `resources.limits.cpu`                    | CPU resource limits                              | `500m`                                                  |
| `resources.limits.memory`                 | Memory resource limits                           | `512Mi`                                                 |
| `resources.requests.cpu`                  | CPU resource requests                            | `100m`                                                  |
| `resources.requests.memory`               | Memory resource requests                         | `128Mi`                                                 |
| `nodeSelector`                            | Node labels for pod assignment                   | `{}`                                                    |
| `tolerations`                             | Tolerations for pod assignment                   | `[]`                                                    |
| `affinity`                                | Affinity for pod assignment                       | `{}`                                                    |
| `autoscaling.enabled`                      | Enable autoscaling for the deployment               | `false`                                                 |
| `autoscaling.minReplicas`                  | Minimum number of replicas                          | `1`                                                     |
| `autoscaling.maxReplicas`                  | Maximum number of replicas                          | `10`                                                    |
| `autoscaling.targetCPUUtilizationPercentage` | Target CPU utilization percentage                 | `80`                                                    |
| `autoscaling.targetMemoryUtilizationPercentage` | Target memory utilization percentage           | `80`                                                    |
| `autoscaling.customMetrics`                | Custom metrics for autoscaling (optional)           | `[]`                                                    |
| `autoscaling.behavior.scaleDown`           | Scale down behavior configuration (optional)        | `{}`                                                    |
| `autoscaling.behavior.scaleUp`             | Scale up behavior configuration (optional)          | `{}`                                                    |
| `serviceAccount.create`                    | Specifies whether a service account should be created | `true`                                                 |
| `serviceAccount.annotations`               | Annotations to add to the service account           | `{}`                                                    |
| `serviceAccount.name`                      | The name of the service account to use              | `""`                                                    |

## Values.yaml Structure

The `values.yaml` file is organized into the following main sections:

1. **Basic Deployment Settings**
   - `replicaCount`: Number of replicas for the deployment

2. **Image Settings**
   - `image.repository`: Docker image repository
   - `image.tag`: Docker image tag
   - `image.pullPolicy`: Image pull policy

3. **Service Settings**
   - `service.type`: Kubernetes service type
   - `service.port`: Service port
   - `service.targetPort`: Target port in the container

4. **Ingress Settings**
   - `ingress.enabled`: Enable/disable ingress
   - `ingress.className`: Ingress class name
   - `ingress.annotations`: Ingress annotations
   - `ingress.hosts`: Host configuration
   - `ingress.tls`: TLS configuration

5. **Puttable Application Settings**
   - `puttable.baseUrl`: Base URL for the application
   - `puttable.supabase`: Supabase configuration
     - `url`: Supabase URL
     - `apiKey`: API key configuration (value or secret)
   - `puttable.keycloak`: Keycloak configuration
     - `clientId`: Keycloak client ID
     - `clientSecret`: Client secret configuration (value or secret)
     - `redirectUri`: Redirect URI
     - `realmUrl`: Realm URL

6. **Environment Variables**
   - `env`: Additional environment variables

7. **Resource Settings**
   - `resources.limits`: Resource limits
   - `resources.requests`: Resource requests

8. **Node Placement Settings**
   - `nodeSelector`: Node selector configuration
   - `tolerations`: Tolerations configuration
   - `affinity`: Affinity configuration

9. **Autoscaling Settings**
   - `autoscaling.enabled`: Enable/disable autoscaling
   - `autoscaling.minReplicas`: Minimum replicas
   - `autoscaling.maxReplicas`: Maximum replicas
   - `autoscaling.targetCPUUtilizationPercentage`: Target CPU utilization
   - `autoscaling.targetMemoryUtilizationPercentage`: Target memory utilization
   - `autoscaling.customMetrics`: Custom metrics for autoscaling
   - `autoscaling.behavior`: Scaling behavior configuration

10. **Service Account Settings**
    - `serviceAccount.create`: Create service account
    - `serviceAccount.annotations`: Service account annotations
    - `serviceAccount.name`: Service account name

Specify each parameter using the `--set key=value[,key=value]` argument to `helm install`. For example:

```bash
helm install my-puttable ./chart --set replicaCount=2
```

To enable the Ingress resource:

```bash
helm install my-puttable ./chart --set ingress.enabled=true --set ingress.hosts[0].host=puttable.example.com
```

To use a custom ServiceAccount:

```bash
helm install my-puttable ./chart --set serviceAccount.name=my-service-account
```

To enable autoscaling:

```bash
helm install my-puttable ./chart --set autoscaling.enabled=true --set autoscaling.minReplicas=2 --set autoscaling.maxReplicas=5 --set autoscaling.targetCPUUtilizationPercentage=75
```

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example:

```bash
helm install my-puttable ./chart -f values.yaml
```
