terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = "retailhub-services"
  region  = "us-central1"
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name                = "retailhub-services-cluster"
  location            = "us-central1-a"
  initial_node_count  = 2
  deletion_protection = false

  node_config {
    machine_type = "e2-standard-2"
  }

  workload_identity_config {
    workload_pool = "retailhub-services.svc.id.goog"
  }
}

# Cloud SQL - Order Service
resource "google_sql_database_instance" "order" {
  name             = "order-postgres"
  database_version = "POSTGRES_14"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
  }
}

# Cloud SQL - Payment Service
resource "google_sql_database_instance" "payment" {
  name             = "payment-postgres"
  database_version = "POSTGRES_14"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
  }
}

# Cloud SQL - Loyalty Service
resource "google_sql_database_instance" "loyalty" {
  name             = "loyalty-postgres"
  database_version = "POSTGRES_14"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
  }
}

# Cloud SQL - User Service
resource "google_sql_database_instance" "user" {
  name             = "user-postgres"
  database_version = "POSTGRES_14"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
  }
}

# Cloud SQL - Product Service
resource "google_sql_database_instance" "product" {
  name             = "product-postgres"
  database_version = "POSTGRES_14"
  region           = "us-central1"
  deletion_protection = false

  settings {
    tier              = "db-f1-micro"
    availability_type = "ZONAL"
  }
}

# Pub/Sub - Order Events
resource "google_pubsub_topic" "order_events" {
  name = "order-events"
}

# Pub/Sub - Payment Events
resource "google_pubsub_topic" "payment_events" {
  name = "payment-events"
}

# Pub/Sub - Loyalty Events
resource "google_pubsub_topic" "loyalty_events" {
  name = "loyalty-events"
}

# Pub/Sub - User Events
resource "google_pubsub_topic" "user_events" {
  name = "user-events"
}

# Pub/Sub - Product Events
resource "google_pubsub_topic" "product_events" {
  name = "product-events"
}

# Outputs
output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_endpoint" {
  value = google_container_cluster.primary.endpoint
}

output "sql_instances" {
  value = [
    google_sql_database_instance.order.name,
    google_sql_database_instance.payment.name,
    google_sql_database_instance.loyalty.name,
    google_sql_database_instance.user.name,
    google_sql_database_instance.product.name
  ]
}

output "pubsub_topics" {
  value = [
    google_pubsub_topic.order_events.name,
    google_pubsub_topic.payment_events.name,
    google_pubsub_topic.loyalty_events.name,
    google_pubsub_topic.user_events.name,
    google_pubsub_topic.product_events.name
  ]
}
