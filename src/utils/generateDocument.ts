import {
    Document,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType,
} from "docx";
import { Word } from "../interfaces/model";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { UserOptions } from "jspdf-autotable";

interface jsPDFCustom extends jsPDF {
    autoTable: (options: UserOptions) => void;
}

export const exportToPdf = async (words: Word[]) => {
    const doc = new jsPDF() as jsPDFCustom;

    // Set the document title
    doc.setFontSize(18);

    // Define the table columns
    const tableColumn = ["Word", "Definition", "Notes"];

    // Map words to table rows
    const tableRows = words.map((word) => [
        word.word,
        `(${word.partOfSpeech}): ${word.definition}`,
        word.notes || "", // Notes may be empty
    ]);

    // Add the table to the PDF
    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 20, // Position the table below the title
        styles: {
            cellPadding: 3,
            fontSize: 10,
            valign: "middle",
            halign: "left", // Horizontal alignment
        },
        headStyles: {
            fillColor: [0, 0, 0], // Black background
            textColor: [255, 255, 255], // White text
            fontStyle: "bold",
        },
    });

    // Save the PDF
    const blob = doc.output("blob");
    const url = URL.createObjectURL(blob);
    return url;
};

export const exportToDocx = async (words: Word[]) => {
    const headerRow = new TableRow({
        children: [
            new TableCell({
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "Word", bold: true })],
                    }),
                ],
                width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: "Definition", bold: true }),
                        ],
                    }),
                ],
                width: { size: 33, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
                children: [
                    new Paragraph({
                        children: [new TextRun({ text: "Notes", bold: true })],
                    }),
                ],
                width: { size: 33, type: WidthType.PERCENTAGE },
            }),
        ],
    });

    // Create rows for each word
    const rows = words.map(
        (word) =>
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph(word.word)],
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `(${word.partOfSpeech}): `,
                                        italics: true, // Optional: makes the partOfSpeech bold
                                    }),
                                    new TextRun({
                                        text: word.definition,
                                    }),
                                ],
                            }),
                        ],
                    }),
                    new TableCell({
                        children: [new Paragraph(word.notes)],
                    }),
                ],
            })
    );

    // Combine header and rows
    const table = new Table({
        rows: [headerRow, ...rows],
        width: {
            size: 100,
            type: WidthType.PERCENTAGE,
        },
    });

    // Create a document with the table
    const doc = new Document({
        sections: [
            {
                children: [table],
            },
        ],
    });

    // Generate the DOCX file

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    return url;
};
