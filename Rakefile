task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec/unit --recursive --compilers 'coffee:coffee-script'"
  end

  desc "Run integration"
  task :integration => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec/integration --recursive --compilers 'coffee:coffee-script'"
  end

  desc "Run tests in a specific file"
  task :focused, :filename, :needs => [:compile_coffee] do |t, args|
    sh "#{local_mocha} #{args[:filename]} --recursive --compilers 'coffee:coffee-script'"
  end
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
