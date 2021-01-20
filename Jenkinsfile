pipeline {
    agent {
        kubernetes {
            label 'node-fermium'
        }
    }
    environment {
        REPOSITORY = 'molgenis/molgenis-theme'
        LOCAL_REPOSITORY = "${LOCAL_REGISTRY}/${REPOSITORY}"
        npm_config_registry = "https://registry.npmjs.org"
    }
    stages {
        stage('Prepare') {
            steps {
                script {
                    env.GIT_COMMIT = sh(script: 'git rev-parse HEAD', returnStdout: true).trim()
                }
                container('vault') {
                    script {
                        env.GITHUB_TOKEN = sh(script: 'vault read -field=value secret/ops/token/github', returnStdout: true)
                        env.NEXUS_AUTH = sh(script: 'vault read -field=base64 secret/ops/account/nexus', returnStdout: true)
                        env.NPM_TOKEN = sh(script: 'vault read -field=value secret/ops/token/npm', returnStdout: true)
                        npm_config_registry = "https://registry.npmjs.org"
                    }
                }
            }
        }
        stage('Install and test') {
            when {
                not {
                    changelog '.*\\[skip ci\\]$'
                }
            }
            steps {
                container('node') {
                    sh "yarn install"
                    sh "yarn lint"
                    sh "yarn build --all"
                }
            }
        }
        stage('Build container serving the artifacts [ PR ]') {
            when {
                changeRequest()
            }
            environment {
                TAG = "PR-${CHANGE_ID}"
                DOCKER_CONFIG="/root/.docker"
            }
            steps {
                container (name: 'kaniko', shell: '/busybox/sh') {
                    sh "#!/busybox/sh\nmkdir -p ${DOCKER_CONFIG}"
                    sh "#!/busybox/sh\necho '{\"auths\": {\"registry.molgenis.org\": {\"auth\": \"${NEXUS_AUTH}\"}}}' > ${DOCKER_CONFIG}/config.json"
                    sh "#!/busybox/sh\n/kaniko/executor --context ${WORKSPACE} --destination ${LOCAL_REPOSITORY}:${TAG}"
                }
            }
        }
        stage('Deploy preview [ PR ]') {
            when {
                changeRequest()
            }
            environment {
                TAG = "PR-${CHANGE_ID}"
                NAME = "preview-theme-${TAG.toLowerCase()}"
            }
            steps {
                container('vault') {
                    sh "mkdir ${JENKINS_AGENT_WORKDIR}/.rancher"
                    sh "vault read -field=value secret/ops/jenkins/rancher/cli2.json > ${JENKINS_AGENT_WORKDIR}/.rancher/cli2.json"
                }
                container('rancher') {
                    sh "rancher apps delete ${NAME} || true"
                    sh "sleep 5s" // wait for deletion
                    sh "rancher apps install " +
                        "cattle-global-data:molgenis-helm-molgenis-frontend " +
                        "${NAME} " +
                        "--no-prompt " +
                        "--set environment=dev " +
                        "--set image.tag=${TAG} " +
                        "--set image.repository=${LOCAL_REGISTRY} " +
                        "--set image.name=${REPOSITORY} " +
                        "--set proxy.backend.service.enabled=false " +
                        "--set image.pullPolicy=Always " +
                        "--set readinessPath=/"
                }
            }
            post {
                success {
                    hubotSend(message: "PR Preview available on https://${NAME}.dev.molgenis.org", status:'INFO', site: 'slack-pr-app-team')
                    container('node') {
                        sh "set +x; curl -X POST -H 'Content-Type: application/json' -H 'Authorization: token ${GITHUB_TOKEN}' " +
                            "--data '{\"body\":\":star: PR Preview available on https://${NAME}.dev.molgenis.org\"}' " +
                            "https://api.github.com/repos/molgenis/molgenis-theme/issues/${CHANGE_ID}/comments"
                    }
                }
            }
        }
    }
    post {
        failure {
            hubotSend(message: 'Build failed', status:'ERROR', site: 'slack-pr-app-team')
        }
    }
}
