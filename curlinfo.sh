curl --user $(cat /home/pi/mnt/node/.cookie) --data-binary '{"jsonrpc": "1.0", "id":"curltest", "method": "getblockchaininfo", "params": [] }' -H 'content-type: text/plain;' http://localhost:8232/
