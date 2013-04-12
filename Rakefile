task :default => %w[spec:unit spec:integration]

namespace :spec do
  desc "Run units"
  task :unit => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec_compiled/unit --recursive"
  end

  desc "Run integration"
  task :integration => [:npm_install, :compile_coffee] do
    sh "#{local_mocha} spec_compiled/integration --recursive"
  end

  desc "Run tests in a specific file"
  task :focused, [:filename] => [:compile_coffee] do |t, args|
    compiled_filename = args[:filename].sub(/\Aspec/, "spec_compiled").sub(/\.coffee\z/, ".js")

    sh "#{local_mocha} #{compiled_filename}"
  end
end

task :npm_install do
  unless File.exist?(local_mocha)
    sh "npm install"
  end
end

task :clean do
  %w[lib spec_compiled].each do |dir|
    sh "rm -rf #{dir}/*"
  end
end

task :compile_coffee => [:clean] do
  sh "./node_modules/.bin/coffee --map -cbo ./lib ./src"
  sh "./node_modules/.bin/coffee --map -cbo ./spec_compiled ./spec"
end

def local_mocha
  "./node_modules/mocha/bin/mocha"
end
