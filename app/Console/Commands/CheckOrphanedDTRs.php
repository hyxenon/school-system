<?php

namespace App\Console\Commands;

use App\Models\DTR;
use App\Models\Employee;
use Illuminate\Console\Command;

class CheckOrphanedDTRs extends Command
{
    protected $signature = 'dtr:check-orphaned {--fix : Fix orphaned records by setting employee_id to null}';
    protected $description = 'Check for DTR records with invalid employee_id values';

    public function handle()
    {
        $this->info('Checking for orphaned DTR records...');

        // Get all employee IDs
        $validEmployeeIds = Employee::pluck('id')->toArray();
        
        // Find DTR records with employee_id that doesn't exist in employees table
        $orphanedRecords = DTR::whereNotIn('employee_id', $validEmployeeIds)
            ->where('employee_id', '!=', null)
            ->get();
        
        if ($orphanedRecords->isEmpty()) {
            $this->info('No orphaned DTR records found with invalid employee_id values.');
            return;
        }

        $this->info('Found ' . $orphanedRecords->count() . ' orphaned DTR records:');

        $headers = ['DTR ID', 'Date', 'Employee ID', 'Status'];
        $rows = [];

        foreach ($orphanedRecords as $record) {
            $rows[] = [
                $record->id,
                $record->date->format('Y-m-d'),
                $record->employee_id,
                $record->status
            ];
        }

        $this->table($headers, $rows);

        // Fix orphaned records if requested
        if ($this->option('fix')) {
            $this->info('Fixing orphaned records...');
            
            foreach ($orphanedRecords as $record) {
                $this->line("Setting null employee_id for DTR #{$record->id}");
                $record->employee_id = null;
                $record->save();
            }
            
            $this->info('All orphaned DTR records have been fixed by setting employee_id to null.');
        } else {
            $this->info('Run with --fix option to set invalid employee_id values to null.');
        }
    }
}