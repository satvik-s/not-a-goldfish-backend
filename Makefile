deploy:
	rm -rf dist*
	rm -rf cdk.out
	npm run build-create-function
	npm run build-retrieve-function
	cdk bootstrap
	cdk synth
	cdk deploy
