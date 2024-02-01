#!/bin/bash
sudo mount -o windows_names,norecover,big_writes,streams_interface=windows,inherit /dev/sda2 /home/pi/mnt && screen -S new -d -m -- sh -c '/home/pi/zcashd --datadir=/home/pi/mnt/node --exportdir=/home/pi/mnt/node ;  exec $SHELL'
