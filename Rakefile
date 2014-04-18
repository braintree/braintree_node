task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => [:compile_coffee, :npm_install] do
    sh "#{local_mocha} spec_compiled/unit --recursive"
  end

  desc "Run integration"
  task :integration => [:compile_coffee, :npm_install] do
    sh "#{local_mocha} spec_compiled/integration --recursive"
  end

  desc "Run tests in a specific file, e.g. rake spec:focused[spec/integration/braintree/credit_card_gateway_spec]"
  task :focused, [:filename] => [:compile_coffee, :npm_install] do |t, args|
    compiled_filename = args[:filename].sub(/\Aspec/, "spec_compiled").sub(/\.coffee\z/, ".js")

    sh "#{local_mocha} #{compiled_filename}"
  end
end

task :install_coffee do
  unless File.exist?(local_coffee)
    sh "npm install coffee-script"
  end
end

task :npm_install do
  sh "npm install --force"
end

task :clean do
  %w[lib spec_compiled].each do |dir|
    sh "rm -rf #{dir}/*"
  end
end

task :compile_coffee => [:clean, :install_coffee] do
  sh "#{local_coffee} --map -cbo ./lib ./src"
  sh "#{local_coffee} --map -cbo ./spec_compiled ./spec"
end

def local_coffee
  "./node_modules/.bin/coffee"
end

def local_mocha
  "./node_modules/mocha/bin/mocha --timeout 62000"
end
