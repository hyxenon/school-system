import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ClassStudent, GradeWeights } from '@/types';
import { Search } from 'lucide-react';
import React, { useState } from 'react';

interface StudentSectionProps {
    students: ClassStudent[];
    userRole: 'teacher' | 'student';
    currentUserId: number;
    weights: GradeWeights;
}

// Helper functions for grade calculations
const calculateGradeByPeriodAndType = (submissions, period: string, type: string) => {
    if (!submissions?.length) return 0;
    const filteredSubmissions = submissions.filter((submission) => {
        return submission.grade && submission.assignment && submission.assignment.period === period && submission.assignment.assessment_type === type;
    });

    if (!filteredSubmissions.length) {
        return 0;
    }

    const sum = filteredSubmissions.reduce((acc, submission) => {
        const percentage = (submission.grade / submission.assignment.total_points) * 100;
        return acc + percentage;
    }, 0);

    const average = (sum / filteredSubmissions.length).toFixed(1);
    return average;
};

const calculatePeriodAverage = (submissions, period: string, weights: GradeWeights) => {
    if (!submissions?.length) return 0;

    const types = ['Assignment', 'Quiz', 'Exam'];
    let weightedSum = 0;
    let totalWeight = 0;

    types.forEach((type) => {
        const grade = parseFloat(calculateGradeByPeriodAndType(submissions, period, type));
        if (!isNaN(grade) && grade > 0) {
            weightedSum += grade * (weights[type] / 100);
            totalWeight += weights[type] / 100;
        }
    });

    if (totalWeight === 0) return 0;
    return (weightedSum / totalWeight).toFixed(1);
};

const calculateOverallGrade = (submissions, weights: GradeWeights) => {
    if (!submissions?.length) return 0;

    const periods = ['Prelims', 'Midterms', 'Finals'];
    const validPeriodGrades = periods
        .map((period) => {
            const average = parseFloat(calculatePeriodAverage(submissions, period, weights));
            return isNaN(average) || average === 0 ? null : average;
        })
        .filter((grade) => grade !== null);

    if (!validPeriodGrades.length) return 0;

    const sum = validPeriodGrades.reduce((a, b) => a + b, 0);
    return (sum / validPeriodGrades.length).toFixed(1);
};

const StudentGrades = ({ student, weights }: { student: ClassStudent; weights: GradeWeights }) => {
    return (
        <>
            <div className="mb-2 flex items-center justify-between">
                <div>
                    <p className="font-medium capitalize">{student.name}</p>
                    <p className="text-muted-foreground text-sm">{student.student_number}</p>
                </div>
                <div className="text-right">
                    <p className="text-lg font-bold">Overall: {calculateOverallGrade(student.submissions, weights)}%</p>
                </div>
            </div>
            <div className="mt-4 grid gap-4">
                {['Prelims', 'Midterms', 'Finals'].map((period) => (
                    <div key={period} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="font-medium">{period}</h4>
                            <Badge>{calculatePeriodAverage(student.submissions, period, weights)}%</Badge>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">Assignments: {calculateGradeByPeriodAndType(student.submissions, period, 'Assignment')}%</Badge>
                            <Badge variant="outline">Quizzes: {calculateGradeByPeriodAndType(student.submissions, period, 'Quiz')}%</Badge>
                            <Badge variant="outline">Exams: {calculateGradeByPeriodAndType(student.submissions, period, 'Exam')}%</Badge>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

const StudentView = ({ student, weights }: { student: ClassStudent; weights: GradeWeights }) => {
    // Enhanced student view with more detailed personal statistics
    const overallGrade = calculateOverallGrade(student.submissions, weights);
    const gradingStatus = Number(overallGrade) >= 75 ? 'Passing' : 'Needs Improvement';
    const gradeColor = Number(overallGrade) >= 75 ? 'text-green-600' : 'text-amber-600';

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-semibold">Your Progress</h2>
                    <p className="text-muted-foreground">Track your performance in this class</p>
                </div>
                <div className="text-right">
                    <div className={`text-2xl font-bold ${gradeColor}`}>{overallGrade}%</div>
                    <Badge variant={Number(overallGrade) >= 75 ? 'default' : 'outline'} className="mt-1">
                        {gradingStatus}
                    </Badge>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {['Prelims', 'Midterms', 'Finals'].map((period) => {
                    const periodAverage = calculatePeriodAverage(student.submissions, period, weights);
                    const isPassing = Number(periodAverage) >= 75;

                    return (
                        <Card key={period} className="p-4 shadow-sm">
                            <h3 className="mb-2 font-semibold">{period}</h3>
                            <div className={`mb-4 text-2xl font-bold ${isPassing ? 'text-green-600' : 'text-amber-600'}`}>{periodAverage}%</div>

                            <div className="space-y-3">
                                {['Assignment', 'Quiz', 'Exam'].map((type) => {
                                    const typeGrade = calculateGradeByPeriodAndType(student.submissions, period, type);
                                    return (
                                        <div key={type} className="flex items-center justify-between">
                                            <span>{type}s</span>
                                            <div className="flex items-center">
                                                <div className="mr-2 h-1.5 w-16 overflow-hidden rounded-full bg-gray-200">
                                                    <div
                                                        className={`h-full rounded-full ${
                                                            Number(typeGrade) >= 75
                                                                ? 'bg-green-500'
                                                                : Number(typeGrade) >= 50
                                                                  ? 'bg-amber-500'
                                                                  : 'bg-red-500'
                                                        }`}
                                                        style={{ width: `${Math.min(100, Number(typeGrade))}%` }}
                                                    ></div>
                                                </div>
                                                <span className="font-medium">{typeGrade}%</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="mt-8 rounded-lg bg-gray-50 p-4">
                <h3 className="mb-3 text-lg font-semibold">Grade Calculation</h3>
                <div className="mb-4">
                    <p className="text-muted-foreground mb-2 text-sm">This course uses the following weights to calculate your grades:</p>
                    <div className="flex flex-wrap gap-3">
                        <Badge variant="outline" className="px-3 py-1">
                            Assignments: {weights.Assignment}%
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            Quizzes: {weights.Quiz}%
                        </Badge>
                        <Badge variant="outline" className="px-3 py-1">
                            Exams: {weights.Exam}%
                        </Badge>
                    </div>
                </div>
                <div className="text-muted-foreground text-sm">
                    <p>Your overall grade is calculated by:</p>
                    <ol className="mt-1 list-decimal space-y-1 pl-5">
                        <li>Computing the weighted average for each period</li>
                        <li>Taking the average of all periods with grades</li>
                        <li>A grade of 75% or higher is considered passing</li>
                    </ol>
                </div>
            </div>
        </div>
    );
};

const StudentSection: React.FC<StudentSectionProps> = ({ students, userRole, currentUserId, weights }) => {
    // For student role, provide an enhanced personal view
    if (userRole === 'student') {
        const currentStudent = students.find((student) => student.user_id === currentUserId);
        if (!currentStudent) return null;

        return <StudentView student={currentStudent} weights={weights} />;
    }

    // For teachers, implement pagination and search
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const studentsPerPage = 10;

    // Filter students by search term with proper null checks
    const filteredStudents = searchTerm
        ? students.filter((student) => {
              if (!student) return false;

              // Convert search term to lowercase once
              const searchLower = searchTerm.toLowerCase();

              // Safely check if properties exist and contain the search term
              const nameMatch = student.name ? student.name.toLowerCase().includes(searchLower) : false;
              const numberMatch = student.student_number ? student.student_number.toLowerCase().includes(searchLower) : false;

              return nameMatch || numberMatch;
          })
        : students;

    const indexOfLastStudent = currentPage * studentsPerPage;
    const indexOfFirstStudent = indexOfLastStudent - studentsPerPage;
    const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);

    // Navigate between pages
    const nextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const prevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const goToPage = (pageNumber: number) => setCurrentPage(pageNumber);

    // Generate page numbers to display
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPageButtons = 5; // Show max 5 page buttons at once

        if (totalPages <= maxPageButtons) {
            // If we have 5 or fewer pages, show all of them
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Always include first page
            pageNumbers.push(1);

            // Calculate start and end of the page range to show
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            // Adjust range if we're near the beginning or end
            if (currentPage <= 2) {
                endPage = 4;
            } else if (currentPage >= totalPages - 1) {
                startPage = totalPages - 3;
            }

            // Add ellipsis if needed at the beginning
            if (startPage > 2) {
                pageNumbers.push('...');
            }

            // Add middle pages
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }

            // Add ellipsis if needed at the end
            if (endPage < totalPages - 1) {
                pageNumbers.push('...');
            }

            // Always include last page
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    return (
        <div>
            {/* Search input */}
            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-gray-500" />
                    <Input
                        placeholder="Search students..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="text-muted-foreground text-sm">
                    Showing {indexOfFirstStudent + 1}-{Math.min(indexOfLastStudent, filteredStudents.length)} of {filteredStudents.length} students
                </div>
            </div>

            {/* Students list */}
            <div className="divide-y">
                {currentStudents.length > 0 ? (
                    currentStudents.map((student) => (
                        <div key={student.id} className="py-4">
                            <StudentGrades student={student} weights={weights} />
                        </div>
                    ))
                ) : (
                    <div className="py-8 text-center">
                        <p className="text-muted-foreground">No students found.</p>
                    </div>
                )}
            </div>

            {/* Pagination controls */}
            {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-1">
                    <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
                        Previous
                    </Button>

                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {typeof page === 'number' ? (
                                <Button variant={currentPage === page ? 'default' : 'outline'} size="sm" onClick={() => goToPage(page)}>
                                    {page}
                                </Button>
                            ) : (
                                <span className="mx-1">...</span>
                            )}
                        </React.Fragment>
                    ))}

                    <Button variant="outline" size="sm" onClick={nextPage} disabled={currentPage === totalPages}>
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default StudentSection;
