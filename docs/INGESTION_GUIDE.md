## 1. Supported Formats
Currently, the ingestion system supports:
- **HTML files** (`.html`, `.htm`)
- **PDF files** (`.pdf`) - *Requires `pdf-parse` library*
- **Word files** (`.docx`) - *Requires `mammoth` library*
- **Plain Text** (`.txt`)

> [!NOTE]
> If PDF or DOCX parsing fails, ensure you have successfully run `npm install pdf-parse mammoth` in the `server` directory.

## 2. File Placement
Place your new files in the `law_knowlege_base` directory. You can organize them into subfolders (e.g., by Year, Type, or Jurisdiction). The folder name immediately under the source root is used as the **Category**.

**Path:** `c:\Users\LENOVO\Desktop\NomosDesk\law_knowlege_base\fg`

### Example Structure:
```text
law_knowlege_base/
└── fg/
    ├── 2024_Acts/          <-- Category: "2024_Acts"
    │   ├── Act_102.html
    │   └── Act_103.html
    └── Supreme_Court/      <-- Category: "Supreme_Court"
        └── Case_2024_001.htm
```

## 3. Running Ingestion
After adding files, you must run the ingestion script to parse and index them into the database.

1.  Open a terminal.
2.  Navigate to the server directory:
    ```powershell
    cd c:\Users\LENOVO\Desktop\LexSovereign\server
    ```
3.  Run the ingestion command:
    ```powershell
    npx ts-node src/scripts/ingest_ghana.ts
    ```

> **Note:** The script will skip files that are already identical in the database (duplicate check logic may vary, currently it upserts based on logic or simply adds new entries—check specific script implementation for details).

## 4. Verification
To verify that your new documents are searchable:

1.  Run the verification script:
    ```powershell
    npx ts-node src/scripts/verify_ghana.ts
    ```
2.  Or, use the Chat API and search for a unique keyword from your new document.

## 5. Troubleshooting
- **HTML Parsing Errors:** If specific files are skipped, check if they are valid HTML.
- **Database Connection:** Ensure the backend server and database are running.
- **Text Extraction:** Using `cheerio`, scripts/styles are removed. If content is missing, check if it was dynamically loaded via JS (not supported by this static parser).
