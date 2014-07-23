task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec_compiled/unit --recursive"
  end

  desc "Run integration"
  task :integration => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} --slow 2000 spec_compiled/integration --recursive"
  end

  desc "Run tests in a specific file, e.g. rake spec:focused[spec/integration/braintree/credit_card_gateway_spec]"
  task :focused, [:filename] => [:npm_install, :compile_coffee] do |t, args|
    compiled_filename = args[:filename].sub(/\Aspec/, "spec_compiled").sub(/\.coffee\z/, ".js")

    command = local_mocha
    if args[:filename].include? "integration"
      command += " --slow 2000"
    end
    sh "#{command} #{compiled_filename}"
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

task :compile_coffee => [:clean] do
  sh "#{local_coffee} --map -cbo ./lib ./src"
  sh "#{local_coffee} --map -cbo ./spec_compiled ./spec"
end

def local_coffee
  "./node_modules/.bin/coffee"
end

def local_mocha
  "./node_modules/mocha/bin/mocha --timeout 62000 --reporter spec"
end
