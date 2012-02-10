task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => :install_vows do
    sh "#{local_vows} " + Dir.glob("spec/unit/**/*_spec.coffee").join(" ")
  end

  desc "Run integration"
  task :integration => :install_vows do
    sh "#{local_vows} " + Dir.glob("spec/integration/**/*_spec.coffee").join(" ")
  end
end

task :install_vows do
  sh "npm install" unless File.exist?(local_vows)
end

def local_vows
  "./node_modules/.bin/vows"
end
