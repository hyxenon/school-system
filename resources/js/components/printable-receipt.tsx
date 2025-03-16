import { Printer } from 'lucide-react';
import { Button } from './ui/button';

const PrintableReceipt = ({ receiptData }) => {
    const printReceipt = () => {
        if (!receiptData) return;

        // Open a new window for printing
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        // Generate receipt HTML
        printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Payment Receipt</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                color: #333;
            }
            .receipt {
                max-width: 800px;
                margin: 0 auto;
                border: 1px solid #ddd;
                padding: 20px;
                background-color: #77C58F;
            }
            .header {
                text-align: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #333;
                padding-bottom: 10px;
            }
            .logo-container {
                margin-bottom: 10px;
            }
            .logo {
                max-width: 150px;
                max-height: 80px;
            }
            .title {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            .subtitle {
                font-size: 14px;
                color: #666;
            }
            .info-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 20px;
            }
            .info-block {
                flex: 1;
            }
            .info-label {
                font-weight: bold;
                margin-bottom: 3px;
            }
            .info-value {
                margin-bottom: 10px;
            }
            .payment-details {
                margin: 20px 0;
                border: 1px solid #eee;
                padding: 15px;
                background-color: #FBFBBB;
            }
            .amount {
                font-size: 18px;
                font-weight: bold;
            }
            .footer {
                margin-top: 30px;
                text-align: center;
                font-size: 12px;
                color: #666;
                border-top: 1px solid #ddd;
                padding-top: 10px;
            }
            .signature {
                margin-top: 40px;
                display: flex;
                justify-content: space-between;
            }
            .signature-line {
                width: 200px;
                border-top: 1px solid #333;
                margin-top: 5px;
                text-align: center;
            }
            @media print {
                body {
                    padding: 0;
                }
                .no-print {
                    display: none;
                }
            }
        </style>
    </head>
    <body>
        <div class="receipt">
            <div class="header">
                <div class="logo-container">
                    <img src="/logo_wup.svg" alt="University Logo" class="logo" />
                </div>
                <div class="title">OFFICIAL RECEIPT</div>
                <div class="subtitle">Receipt #: ${receiptData.receipt_number}</div>
            </div>
            
            <div class="info-section">
                <div class="info-block">
                    <div class="info-label">Student ID:</div>
                    <div class="info-value">${receiptData.student_id}</div>
                    
                    <div class="info-label">Student Name:</div>
                    <div class="info-value">${receiptData.student_name}</div>
                    
                    ${
                        receiptData.course
                            ? `
                    <div class="info-label">Course:</div>
                    <div class="info-value">${receiptData.course}</div>
                    `
                            : ''
                    }
                </div>
                
                <div class="info-block">
                    <div class="info-label">Date:</div>
                    <div class="info-value">${receiptData.payment_date}</div>
                    
                    <div class="info-label">Time:</div>
                    <div class="info-value">${receiptData.payment_time}</div>
                    
                    ${
                        receiptData.academic_year
                            ? `
                    <div class="info-label">Academic Year:</div>
                    <div class="info-value">${receiptData.academic_year}, Semester ${receiptData.semester}</div>
                    `
                            : ''
                    }
                </div>
            </div>
                    
            <div class="payment-details">
                <div class="info-label">Payment Details:</div>
                <div class="info-section">
                    <div class="info-block">
                        ${
                            receiptData.previous_balance !== undefined
                                ? `
                        <div class="info-label">Previous Balance:</div>
                        <div class="info-value">₱${receiptData.previous_balance.toLocaleString()}</div>
                        `
                                : ''
                        }
                        
                        <div class="info-label">Amount Paid:</div>
                        <div class="info-value amount">₱${receiptData.amount.toLocaleString()}</div>
                    </div>
                    
                    <div class="info-block">
                        <div class="info-label">Payment Method:</div>
                        <div class="info-value">${receiptData.payment_method}</div>
                        
                        ${
                            receiptData.new_balance !== undefined
                                ? `
                        <div class="info-label">New Balance:</div>
                        <div class="info-value">₱${receiptData.new_balance.toLocaleString()}</div>
                        `
                                : ''
                        }
                    </div>
                </div>
                <div class="info-label">Payment Type:</div>
                <div class="info-value">${receiptData.payment_type}</div>
            </div>
                    
            <div class="signature">
                <div>
                    <div class="signature-line"></div>
                    <div>Student Signature</div>
                </div>
                
                <div>
                    <div class="signature-line">${receiptData.cashier}</div>
                    <div>Cashier</div>
                </div>
            </div>
                    
            <div class="footer">
                <p>This is an official receipt of payment. Please keep this for your records.</p>
                <p>For inquiries, please contact the Treasury Department.</p>
            </div>
        </div>
                
        <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print();" style="padding: 10px 20px; background: #D68722; color: white; border: none; border-radius: 4px; cursor: pointer;">
                Print Receipt
            </button>
        </div>
    </body>
    </html>
        `);

        printWindow.document.close();
    };

    return (
        <Button variant="outline" className="sm:flex-1" onClick={printReceipt}>
            <Printer className="mr-2 h-4 w-4" />
            Print Receipt
        </Button>
    );
};

export default PrintableReceipt;
