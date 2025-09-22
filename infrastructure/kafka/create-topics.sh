# Kafka Topics Configuration
# This script creates the necessary topics for the microservices

# User events topic
docker exec -it fantacontratti-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic user-events \
    --partitions 3 \
    --replication-factor 1 \
    --config retention.ms=604800000

# Contract events topic
docker exec -it fantacontratti-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic contract-events \
    --partitions 3 \
    --replication-factor 1 \
    --config retention.ms=604800000

# Notification events topic
docker exec -it fantacontratti-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic notification-events \
    --partitions 3 \
    --replication-factor 1 \
    --config retention.ms=604800000

# System events topic for monitoring
docker exec -it fantacontratti-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic system-events \
    --partitions 1 \
    --replication-factor 1 \
    --config retention.ms=86400000

# Dead letter queue for failed messages
docker exec -it fantacontratti-kafka kafka-topics --create \
    --bootstrap-server localhost:9092 \
    --topic dead-letter-queue \
    --partitions 1 \
    --replication-factor 1 \
    --config retention.ms=2592000000

echo "Kafka topics created successfully!"
echo "Available topics:"
docker exec -it fantacontratti-kafka kafka-topics --list --bootstrap-server localhost:9092