task :default => :spec

desc "run the specs"
task :spec do
  sh "vows " + Dir.glob("spec/**/*_spec.js").join(" ")
end
