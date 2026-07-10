<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class TemplateCatalogController extends Controller
{
    public function __invoke(): Response
    {
        return Inertia::render('Teacher/Templates/Index');
    }
}
