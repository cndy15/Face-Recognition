<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up() {
        Schema::create('faces', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('filename');
            $table->timestamps();
        });
    }
    public function down() {
        Schema::dropIfExists('faces');
    }
};
