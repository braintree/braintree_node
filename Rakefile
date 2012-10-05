task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => :install_vows do
    sh "#{local_mocha} spec --recursive --compilers 'coffee:coffee-script'"
  end

  desc "Run integration"
  task :integration => :install_vows do
    sh "#{local_vows} " + Dir.glob("spec/integration/**/*_spec.coffee").join(" ")
  end
end

task :mocha do
  sh "#{local_mocha} spec --recursive --compilers 'coffee:coffee-script'"
end

task :install_vows do
  unless File.exist?(local_mocha) && File.exist?(local_vows)
    sh "npm install"
  end
end

def local_vows
  "./node_modules/.bin/vows"
end

def local_mocha
  "./node_modules/mocha/bin/mocha"
end
