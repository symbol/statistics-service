
echo "Running build of Node Rewards client..."
rimraf src/models/NodeRewards/build src/models/NodeRewards/gen-src &&
swagger-cli validate src/models/NodeRewards/openapi3.yml
openapi-generator-cli generate -i src/models/NodeRewards/openapi3.yml -g typescript-fetch -o src/models/NodeRewards/gen-src --additional-properties=typescriptThreePlus=true,withInterfaces=true,useSingleRequestParameter=false,supportsES6=true
exit 0
