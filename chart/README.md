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
| `env.PUBLIC_SUPABASE_URL`                 | Supabase URL                                     | `"public-supabase-url"`                                 |
| `env.PUBLIC_SUPABASE_ANON_KEY`            | Supabase anonymous key                           | `"the-anon-key"`                                        |
| `env.PUBLIC_SUPABASE_AUTH_KEYCLOAK_REDIRECT_URI` | Keycloak redirect URI                     | `"http://localhost:54321/auth/v1/callback"`             |
| `env.PUBLIC_SITE_BASE_URL`                | Site base URL                                    | `"http://localhost:3000"`                               |
| `env.SUPABASE_AUTH_KEYCLOAK_CLIENT_ID`    | Keycloak client ID                               | `"keycloak-client-id"`                                  |
| `env.SUPABASE_AUTH_KEYCLOAK_SECRET`       | Keycloak client secret                           | `"keycloak-client-secret"`                              |
| `env.SUPABASE_AUTH_KEYCLOAK_URL`          | Keycloak URL                                     | `"keycloak-url"`                                        |
| `env.HOST`                                | Host to bind to                                  | `"0.0.0.0"`                                             |
| `env.PORT`                                | Port to bind to                                  | `"3000"`                                                |
| `env.BASE_PATH`                           | Base path for the application                    | `"http://localhost:3000"`                               |
| `env.CHECK_ORIGIN`                        | Whether to check origin                          | `"true"`                                                |
| `env.NODE_ENV`                            | Node environment                                 | `"production"`                                          |
| `resources.limits.cpu`                    | CPU resource limits                              | `500m`                                                  |
| `resources.limits.memory`                 | Memory resource limits                           | `512Mi`                                                 |
| `resources.requests.cpu`                  | CPU resource requests                            | `100m`                                                  |
| `resources.requests.memory`               | Memory resource requests                         | `128Mi`                                                 |
| `nodeSelector`                            | Node labels for pod assignment                   | `{}`                                                    |
| `tolerations`                             | Tolerations for pod assignment                   | `[]`                                                    |
| `affinity`                                | Affinity for pod assignment                       | `{}`                                                    |
| `serviceAccount.create`                    | Specifies whether a service account should be created | `true`                                                 |
| `serviceAccount.annotations`               | Annotations to add to the service account           | `{}`                                                    |
| `serviceAccount.name`                      | The name of the service account to use              | `""`                                                    |

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

Alternatively, a YAML file that specifies the values for the parameters can be provided while installing the chart. For example:

```bash
helm install my-puttable ./chart -f values.yaml
```
