{{/*
Create the name of the service account to use
*/}}
{{- define "puttable.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "puttable.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
*/}}
{{- define "puttable.fullname" -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- end }}