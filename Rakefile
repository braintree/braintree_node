task :default => :spec

desc "run the specs"
task :spec do
  local_vows = "./node_modules/.bin/vows"
  sh "npm install" unless File.exist?(local_vows)
  sh "#{local_vows} " + Dir.glob("spec/**/*_spec.{coffee,js}").join(" ")
end
