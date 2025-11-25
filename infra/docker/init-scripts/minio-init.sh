#!/bin/sh
set -e

echo "[MinIO Init] Starting bucket initialization..."

# Wait for MinIO to be fully ready
sleep 5

# Install mc (MinIO Client) if not present
if ! command -v mc >/dev/null 2>&1; then
    echo "[MinIO Init] Installing MinIO client..."
    wget -q https://dl.min.io/client/mc/release/linux-amd64/mc -O /usr/local/bin/mc
    chmod +x /usr/local/bin/mc
fi

# Configure MinIO client alias
echo "[MinIO Init] Configuring MinIO client..."
mc alias set local http://localhost:9000 ${MINIO_ROOT_USER:-minioadmin} ${MINIO_ROOT_PASSWORD:-minioadmin}

# Create required buckets
BUCKETS="dentalos-local dentalos-documents dentalos-images dentalos-backups"

for bucket in $BUCKETS; do
    if mc ls local/$bucket >/dev/null 2>&1; then
        echo "[MinIO Init] Bucket '$bucket' already exists"
    else
        echo "[MinIO Init] Creating bucket '$bucket'..."
        mc mb local/$bucket

        # Set public download policy for images bucket (optional)
        if [ "$bucket" = "dentalos-images" ]; then
            echo "[MinIO Init] Setting download policy for '$bucket'..."
            mc anonymous set download local/$bucket
        fi
    fi
done

echo "[MinIO Init] Bucket initialization complete!"
echo "[MinIO Init] Created buckets: $BUCKETS"
