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
    const tableColumn = ["Word", "Definitions", "Notes"];

    // Map words to table rows
    const tableRows = words.map((word) => {
        // Format definitions and notes
        const formattedDefinitions = word.definitions
            .map((def, index) => `${index + 1}. (${word.partOfSpeech}) ${def.definition}`)
            .join("\n");

        const formattedNotes = word.definitions
            .map((def, index) => def.notes ? `${index + 1}. ${def.notes}` : "")
            .filter(note => note !== "")
            .join("\n");

        return [
            word.word,
            formattedDefinitions,
            formattedNotes
        ];
    });

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
                            new TextRun({ text: "Definitions", bold: true }),
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
                        children: word.definitions.map((def, index) =>
                            new Paragraph({
                                children: [
                                    new TextRun({
                                        text: `${index + 1}. (${word.partOfSpeech}): `,
                                        italics: true,
                                        bold: true
                                    }),
                                    new TextRun({
                                        text: def.definition,
                                    }),
                                ],
                                spacing: { after: 100 } // Add some space between definitions
                            })
                        ),
                    }),
                    new TableCell({
                        children: word.definitions
                            .filter(def => def.notes && def.notes.trim() !== "")
                            .map((def, index) =>
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: `${index + 1}. ${def.notes}`,
                                        }),
                                    ],
                                    spacing: { after: 100 }
                                })
                            ),
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
