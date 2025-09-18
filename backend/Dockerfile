# Use OpenJDK 17 as the base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Install Maven
RUN apt-get update && apt-get install -y maven && rm -rf /var/lib/apt/lists/*

# Copy pom.xml and download dependencies (for better caching)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Expose port 8080
EXPOSE 8080

# Set the startup command to run the JAR file
CMD ["java", "-jar", "target/workspace-app-backend-1.0.0.jar"]