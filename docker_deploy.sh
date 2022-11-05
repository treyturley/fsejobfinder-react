#!/bin/sh

container_name="fse-ux"

docker_ps=$(docker ps | grep $container_name )

if [[ $docker_ps == *"$container_name"* ]]
then
    echo "$container_name container is running"
    echo "stopping $container_name container"
    docker stop $container_name
else
    echo "$container_name container is not running"
fi

docker_stopped_containers=$(docker ps -a | grep Exit)
if [[ $docker_stopped_containers == *"$container_name"* ]]
then
    echo "$container_name container is stopped"
    echo "removing $container_name container"
    docker rm $container_name
else
    echo "$container_name container not found"
fi

# build the new image
echo building new image for $container_name
docker build -f Dockerfile -t $container_name .

# start container with new image
echo starting $container_name
docker run --name $container_name -p 81:80 -d $container_name
#docker start $container_name

# prune any dangling images
echo pruning images
docker image prune -f
