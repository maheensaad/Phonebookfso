# Use Debian as builder
FROM debian:bullseye as builder

ARG NODE_VERSION=18.14.2

# Install dependencies and Volta
RUN apt-get update && apt-get install -y curl python-is-python3 pkg-config build-essential
RUN curl https://get.volta.sh | bash
ENV VOLTA_HOME /root/.volta
ENV PATH /root/.volta/bin:$PATH
RUN volta install node@${NODE_VERSION}

# Create a directory for the app
RUN mkdir /app
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV production

# Copy application files and install dependencies
COPY . .
RUN npm install

# Use another Debian base image for the runtime container
FROM debian:bullseye

LABEL fly_launch_runtime="nodejs"

# Copy Volta and the app from the builder
COPY --from=builder /root/.volta /root/.volta
COPY --from=builder /app /app

WORKDIR /app
ENV NODE_ENV production
ENV PATH /root/.volta/bin:$PATH

# Define the command to run your application
CMD [ "npm", "run", "start" ]

