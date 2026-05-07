<?php

// php vendor/bin/dep deploy production

namespace Deployer;

require 'recipe/laravel.php';

// Config
set('application', 'loadmaster');
set('repository', 'git@github.com:robertsdzerinsljk/load-master.git');
set('keep_releases', 2);
set('ssh_multiplexing', false);

// Shared and writable dirs
add('shared_files', ['.env']);
add('shared_dirs', ['storage']);
add('writable_dirs', ['bootstrap/cache', 'storage']);

// Production server
host('production')
    ->setHostname('10.11.0.46')
    ->set('remote_user', 'eivis_deploy_user')
    ->setIdentityFile('C:/Users/roberts.dzerins/.ssh/loadmaster_roberts')
    ->set('deploy_path', '/var/www/loadmaster')
    ->set('branch', 'main')
    ->set('stage', 'main');

// Main deploy sequence
desc('Deploy your project');
task('deploy', [
    'deploy:prepare',
    'deploy:vendors',
    'deploy:shared',
    'deploy:writable',
    'artisan:storage:link',
    'artisan:view:clear',
    'deploy:clear_route_cache',
    'artisan:config:cache',
    'artisan:migrate',
    'artisan:db:seed',
    'deploy:remove_vite_hot',
    'deploy:publish',
    'artisan:optimize',
    'deploy:verify_google_routes',
    'deploy:cleanup',
    'deploy:cleanup_files',
]);

task('deploy:clear_route_cache', function () {
    run('{{bin/php}} {{release_path}}/artisan route:clear');
});

task('deploy:remove_vite_hot', function () {
    run('rm -f {{release_path}}/public/hot');
});

task('deploy:verify_google_routes', function () {
    run('{{bin/php}} {{current_path}}/artisan route:list --path=auth/google');
});

task('deploy:cleanup_files', function () {
    run('rm -f {{release_path}}/public/hot');
    run('rm -rf {{release_path}}/tests');
    run('rm -f {{release_path}}/README.md');
    run('rm -f {{release_path}}/.editorconfig');
    run('rm -f {{release_path}}/.env.example');
    run('rm -f {{release_path}}/.gitattributes');
    run('rm -f {{release_path}}/.gitignore');
    run('rm -f {{release_path}}/.prettierrc');
    run('rm -f {{release_path}}/boost.json');
    run('rm -f {{release_path}}/package-lock.json');
    run('rm -f {{release_path}}/package.json');
    run('rm -f {{release_path}}/phpunit.xml');
    run('rm -f {{release_path}}/vite.config.js');
    run('rm -f {{release_path}}/deploy.php');
    run('rm -rf {{release_path}}/examples');
    run('rm -rf {{release_path}}/database');
});

// Hooks
after('deploy:failed', 'deploy:unlock');
