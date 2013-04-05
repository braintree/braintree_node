task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec/unit --recursive --compilers 'coffee:coffee-script'"
  end

  desc "Run integration"
  task :integration => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec/integration --recursive --compilers 'coffee:coffee-script'"

    mocha_integration_specs = [
      "address_gateway_spec.coffee",
      "advanced_search_spec.coffee",
      "braintree_spec",
      "credit_card_gateway_spec",
      "credit_card_verification_gateway_spec",
      "credit_card_verification_search_spec",
      "customer_gateway_spec",
      "customer_search_spec",
      "http_spec",
      "settlement_batch_summary_gateway_spec",
    ]

    vows_specs = Dir.glob("spec/integration/**/*_spec.coffee").reject do |file|
      mocha_integration_specs.any? { |spec_name| file.include?(spec_name) }
    end

    sh "#{local_vows} " + vows_specs.join(" ")
  end
end

task :mocha do
  sh "#{local_mocha} spec --recursive --compilers 'coffee:coffee-script'"
end

task :npm_install do
  unless File.exist?(local_mocha) && File.exist?(local_vows)
    sh "npm install"
  end
end

task :compile_coffee do
  sh "find ./lib -name '*.js' -exec rm -f {} \\;"
  sh "./node_modules/.bin/coffee -cbo ./lib ./src"
end

def local_vows
  "./node_modules/.bin/vows"
end

def local_mocha
  "./node_modules/mocha/bin/mocha"
end
