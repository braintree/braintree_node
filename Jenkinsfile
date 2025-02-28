#!groovy

def FAILED_STAGE

pipeline {
  agent none

  environment {
    REPO_NAME = "braintree-node"
    SLACK_CHANNEL = "#auto-team-sdk-builds"
  }

  stages {
    stage("Audit") {
      parallel {
        // Runs a static code analysis scan and posts results to the PayPal Polaris server
        stage("CodeQL") {
          agent {
            node {
              label ""
              customWorkspace "workspace/${REPO_NAME}"
            }
          }

          steps {
            codeQLv2(javascript: true)
          }

          post {
            failure {
              script {
                FAILED_STAGE = env.STAGE_NAME
              }
            }
          }
        }
      }
    }
  }
}
