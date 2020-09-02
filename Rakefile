task :default => %w[test:unit test:integration]
task :test => %w[test:unit test:integration]

namespace :test do

  # Usage:
  #   rake test:unit
  #   rake test:unit[config_spec]
  #   rake test:unit[config_spec,"can be configured with merchant credentials"]
  desc "Run unit tests"
  task :unit, [:file_name, :test_name] => [:npm_install] do |task, args|
    if args.file_name.nil?
      sh "npm test"
    elsif args.test_name.nil?
      sh "#{mocha} spec/unit/braintree/#{args.file_name}.js"
    else
      sh "#{mocha} -g '#{args.test_name}' spec/unit/braintree/#{args.file_name}.js"
    end
  end

  # Usage:
  #   rake test:integration
  #   rake test:integration[plan_gateway_spec]
  #   rake test:integration[plan_gateway_spec,"gets all plans"]
  desc "Run integration tests"
  task :integration, [:file_name, :test_name] => [:npm_install] do |task, args|
    if args.file_name.nil?
      sh "npm run test:integration"
    elsif args.test_name.nil?
      sh "#{mocha} --slow 2000 spec/integration/braintree/#{args.file_name}.js"
    else
      sh "#{mocha} --slow 2000 -g '#{args.test_name}' spec/integration/braintree/#{args.file_name}.js"
    end
  end
end

task :npm_install do
  sh "npm install --force"
end

def mocha
  "./node_modules/mocha/bin/mocha --timeout 62000 --reporter spec -r spec/spec_helper"
end
