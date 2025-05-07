FROM golang:1.24.3-alpine

WORKDIR /app
COPY backend/go.mod backend/go.sum ./
RUN go mod download

COPY backend/ ./
RUN go build -o server .

EXPOSE 8080
CMD ["./server"]
