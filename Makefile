deploy:
	rm -rf dist
	rm -rf cdk.out
	nvm use
	npm run build
	npm run synth
	npm run deploy
