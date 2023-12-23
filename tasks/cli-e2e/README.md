```bash
cd ./tasks/cli-e2e
yarn project:tarsync $PROJECT_PATH
PROJECT_PATH=$PROJECT_PATH yarn node --experimental-vm-modules $(yarn bin jest)
```
