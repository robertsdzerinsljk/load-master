<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Draft = 'draft';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Reviewed = 'reviewed';
    case Approved = 'approved';
}