import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import parse_xml
from docx.oxml.ns import nsdecls
import os
import sys

# Add scripts directory to path
sys.path.append(os.path.dirname(__file__))
from test_cases_data import TEST_CASES

def create_test_cases_document(output_path):
    doc = docx.Document()

    # Configure Margins: 0.75 inch (54 pt) => 7.0 inch printable width
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.75)
        section.bottom_margin = Inches(0.75)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # XML Helper Functions
    def set_cell_shading(cell, color_hex):
        tcPr = cell._tc.get_or_add_tcPr()
        for child in list(tcPr):
            if child.tag.endswith('shd'):
                tcPr.remove(child)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
        tcPr.append(shd)

    def set_table_borders(table, color_hex="94A3B8"):
        tblPr = table._tbl.tblPr
        for child in list(tblPr):
            if child.tag.endswith('tblBorders'):
                tblPr.remove(child)
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
            f'<w:bottom w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
            f'<w:left w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
            f'<w:right w:val="single" w:sz="6" w:space="0" w:color="{color_hex}"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
            f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{color_hex}"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_cell_width(cell, width_inches):
        cell.width = Inches(width_inches)
        tcPr = cell._tc.get_or_add_tcPr()
        w_dxa = int(width_inches * 1440)
        tcW = parse_xml(f'<w:tcW {nsdecls("w")} w:w="{w_dxa}" w:type="dxa"/>')
        tcPr.append(tcW)

    # Document Header Title
    title_p = doc.add_paragraph()
    title_p.paragraph_format.space_before = Pt(0)
    title_p.paragraph_format.space_after = Pt(2)
    title_run = title_p.add_run("Software Engineering – SchemeSaathi Project")
    title_run.font.name = "Arial"
    title_run.font.size = Pt(18)
    title_run.font.bold = True
    title_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    sub_p = doc.add_paragraph()
    sub_p.paragraph_format.space_before = Pt(0)
    sub_p.paragraph_format.space_after = Pt(4)
    sub_run = sub_p.add_run("Core System Test Case Specification Document (Doc: T_01)")
    sub_run.font.name = "Arial"
    sub_run.font.size = Pt(13)
    sub_run.font.bold = True
    sub_run.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    meta_p = doc.add_paragraph()
    meta_p.paragraph_format.space_before = Pt(0)
    meta_p.paragraph_format.space_after = Pt(14)
    meta_run = meta_p.add_run(
        "Standard Template: Dr. Ghazy Assassa (Doc: T_01) | Target System: SchemeSaathi (AI Welfare Platform)\n"
        "Document Version: 2.1 | Scope: 6 High-Impact Core Test Cases | Status: Complete / Verified"
    )
    meta_run.font.name = "Calibri"
    meta_run.font.size = Pt(9.5)
    meta_run.font.italic = True
    meta_run.font.color.rgb = RGBColor(0x47, 0x55, 0x69)

    # Section 1: Official Blank Template
    sec1_p = doc.add_paragraph()
    sec1_p.paragraph_format.space_before = Pt(10)
    sec1_p.paragraph_format.space_after = Pt(4)
    sec1_run = sec1_p.add_run("1. Software Engineering Standard Test Case Template (Doc: T_01)")
    sec1_run.font.name = "Arial"
    sec1_run.font.size = Pt(12)
    sec1_run.font.bold = True
    sec1_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    desc_blank = doc.add_paragraph()
    desc_blank.paragraph_format.space_after = Pt(6)
    desc_blank_run = desc_blank.add_run(
        "The following standardized template (Doc: T_01) establishes the baseline format used across the SchemeSaathi engineering lifecycle for authoring individual unit, integration, and system test cases:"
    )
    desc_blank_run.font.name = "Calibri"
    desc_blank_run.font.size = Pt(10)

    # Blank Template Header Table
    blank_header = doc.add_table(rows=5, cols=2)
    set_table_borders(blank_header, "CBD5E1")
    blank_header.alignment = WD_TABLE_ALIGNMENT.CENTER

    blank_header_data = [
        ("Test Case Name: [Name of the test case]", "Test Case #: [e.g. TC-01]"),
        ("Subsystem: [Subsystem Name]", "System: SchemeSaathi"),
        ("Design Date: DD/MM/YYYY", "Designed by: [Author Name / QA Role]"),
        ("Execution Date: DD/MM/YYYY", "Executed by: [Tester Name / CI]"),
        ("Short Description: [Concise statement of the test objective, scope, and target functionality]", None),
    ]

    for r_idx, row in enumerate(blank_header.rows):
        if r_idx == 4:
            row.cells[0].merge(row.cells[1])
            cell = row.cells[0]
            cell.text = blank_header_data[r_idx][0]
            set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
            set_cell_width(cell, 7.0)
            set_cell_shading(cell, "F8FAFC")
            cell.paragraphs[0].runs[0].font.name = "Calibri"
            cell.paragraphs[0].runs[0].font.size = Pt(9.5)
            cell.paragraphs[0].runs[0].font.bold = True
        else:
            for c_idx in range(2):
                cell = row.cells[c_idx]
                cell.text = blank_header_data[r_idx][c_idx]
                set_cell_margins(cell, top=80, bottom=80, left=120, right=120)
                set_cell_width(cell, 3.5)
                set_cell_shading(cell, "F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
                cell.paragraphs[0].runs[0].font.name = "Calibri"
                cell.paragraphs[0].runs[0].font.size = Pt(9.5)
                txt = cell.paragraphs[0].runs[0].text
                prefix = txt.split(":")[0] + ":"
                rest = txt[len(prefix):]
                cell.paragraphs[0].text = ""
                r1 = cell.paragraphs[0].add_run(prefix)
                r1.font.bold = True
                r1.font.name = "Calibri"
                r1.font.size = Pt(9.5)
                r2 = cell.paragraphs[0].add_run(rest)
                r2.font.name = "Calibri"
                r2.font.size = Pt(9.5)

    # Pre-conditions
    pre_blank = doc.add_paragraph()
    pre_blank.paragraph_format.space_before = Pt(4)
    pre_blank.paragraph_format.space_after = Pt(2)
    p_run = pre_blank.add_run("Pre-conditions:")
    p_run.font.bold = True
    p_run.font.name = "Calibri"
    p_run.font.size = Pt(10)

    pre_blank_item = doc.add_paragraph(style='List Bullet')
    pre_blank_item.paragraph_format.space_after = Pt(4)
    p_item_run = pre_blank_item.add_run("[Prerequisite system state, user credentials, loaded datasets, or network status]")
    p_item_run.font.name = "Calibri"
    p_item_run.font.size = Pt(9.5)
    p_item_run.font.italic = True

    # Blank Steps Table
    blank_steps = doc.add_table(rows=3, cols=5)
    set_table_borders(blank_steps, "CBD5E1")
    blank_steps.alignment = WD_TABLE_ALIGNMENT.CENTER
    step_widths = [0.5, 1.9, 2.3, 0.7, 1.6]

    headers = ["Step", "Action", "Expected System Response", "Pass/Fail", "Comment"]
    for c_idx, head_text in enumerate(headers):
        cell = blank_steps.rows[0].cells[c_idx]
        cell.text = head_text
        set_cell_margins(cell, top=100, bottom=100, left=80, right=80)
        set_cell_width(cell, step_widths[c_idx])
        set_cell_shading(cell, "E2E8F0")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        run = p.runs[0]
        run.font.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)

    for r_idx in range(1, 3):
        row = blank_steps.rows[r_idx]
        row.cells[0].text = str(r_idx)
        row.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
        row.cells[1].text = f"[Action {r_idx}]"
        row.cells[2].text = f"[Expected Response {r_idx}]"
        row.cells[3].text = "Pass / Fail"
        row.cells[4].text = "[Notes]"
        for c_idx in range(5):
            set_cell_margins(row.cells[c_idx], top=80, bottom=80, left=80, right=80)
            set_cell_width(row.cells[c_idx], step_widths[c_idx])
            row.cells[c_idx].paragraphs[0].runs[0].font.name = "Calibri"
            row.cells[c_idx].paragraphs[0].runs[0].font.size = Pt(9)

    post_blank = doc.add_paragraph()
    post_blank.paragraph_format.space_before = Pt(4)
    post_blank.paragraph_format.space_after = Pt(2)
    po_run = post_blank.add_run("Post-conditions:")
    po_run.font.bold = True
    po_run.font.name = "Calibri"
    po_run.font.size = Pt(10)

    post_blank_item = doc.add_paragraph(style='List Bullet')
    post_blank_item.paragraph_format.space_after = Pt(14)
    po_item_run = post_blank_item.add_run("1. [Expected state of the database, session storage, or UI after test completion]")
    po_item_run.font.name = "Calibri"
    po_item_run.font.size = Pt(9.5)
    po_item_run.font.italic = True

    # Page Break for Traceability Matrix & Test Suite
    doc.add_page_break()

    # Section 2: Traceability Matrix
    sec2_p = doc.add_paragraph()
    sec2_p.paragraph_format.space_before = Pt(0)
    sec2_p.paragraph_format.space_after = Pt(4)
    sec2_run = sec2_p.add_run("2. SchemeSaathi Core Test Suite & Traceability Matrix")
    sec2_run.font.name = "Arial"
    sec2_run.font.size = Pt(14)
    sec2_run.font.bold = True
    sec2_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    desc_matrix = doc.add_paragraph()
    desc_matrix.paragraph_format.space_after = Pt(8)
    dm_run = desc_matrix.add_run(
        "The following matrix outlines the 6 core high-impact test cases covering the critical subsystems of SchemeSaathi: "
        "AI conversational discovery, 3-step rapid profiling, official DigiLocker eKYC authentication, formal eligibility verification (DAG), "
        "pre-filled government PDF document generation, and end-to-end lifecycle status tracking:"
    )
    dm_run.font.name = "Calibri"
    dm_run.font.size = Pt(10)

    matrix_data = [
        (tc["id"], tc["subsystem"], tc["name"], tc.get("type", "Functional"), tc.get("priority", "High"), tc.get("status", "Pass"))
        for tc in TEST_CASES
    ]

    mat_table = doc.add_table(rows=len(matrix_data) + 1, cols=6)
    set_table_borders(mat_table, "CBD5E1")
    mat_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    mat_widths = [0.6, 1.4, 2.4, 1.1, 0.7, 0.8]
    mat_headers = ["Test #", "Subsystem", "Test Case Name", "Type", "Priority", "Status"]

    for c_idx, h in enumerate(mat_headers):
        cell = mat_table.rows[0].cells[c_idx]
        cell.text = h
        set_cell_margins(cell, top=90, bottom=90, left=70, right=70)
        set_cell_width(cell, mat_widths[c_idx])
        set_cell_shading(cell, "1E3A8A")
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3, 4, 5] else WD_ALIGN_PARAGRAPH.LEFT
        run = p.runs[0]
        run.font.bold = True
        run.font.name = "Calibri"
        run.font.size = Pt(9.5)
        run.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

    for r_idx, row_data in enumerate(matrix_data):
        row = mat_table.rows[r_idx + 1]
        bg_col = "F8FAFC" if r_idx % 2 == 0 else "FFFFFF"
        for c_idx, val in enumerate(row_data):
            cell = row.cells[c_idx]
            cell.text = val
            set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
            set_cell_width(cell, mat_widths[c_idx])
            set_cell_shading(cell, bg_col)
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3, 4, 5] else WD_ALIGN_PARAGRAPH.LEFT
            run = p.runs[0]
            run.font.name = "Calibri"
            run.font.size = Pt(9)
            if c_idx == 0:
                run.font.bold = True
            elif c_idx == 5:
                run.font.bold = True
                run.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

    doc.add_page_break()

    # Section 3: The 6 Test Cases
    sec3_p = doc.add_paragraph()
    sec3_p.paragraph_format.space_before = Pt(0)
    sec3_p.paragraph_format.space_after = Pt(4)
    sec3_run = sec3_p.add_run("3. Detailed SchemeSaathi Test Case Specifications")
    sec3_run.font.name = "Arial"
    sec3_run.font.size = Pt(14)
    sec3_run.font.bold = True
    sec3_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

    for tc in TEST_CASES:
        tc_head = doc.add_paragraph()
        tc_head.paragraph_format.space_before = Pt(14)
        tc_head.paragraph_format.space_after = Pt(2)
        tc_h_run = tc_head.add_run(f"Test Case: {tc['name']} ({tc['id']})")
        tc_h_run.font.name = "Arial"
        tc_h_run.font.size = Pt(12)
        tc_h_run.font.bold = True
        tc_h_run.font.color.rgb = RGBColor(0x1E, 0x3A, 0x8A)

        # Header Table (Doc: T_01 format)
        htbl = doc.add_table(rows=5, cols=2)
        set_table_borders(htbl, "CBD5E1")
        htbl.alignment = WD_TABLE_ALIGNMENT.CENTER

        rows_spec = [
            (f"Test Case Name: {tc['name']}", f"Test Case #: {tc['id']}"),
            (f"Subsystem: {tc['subsystem']}", "System: SchemeSaathi"),
            (f"Design Date: {tc['date']}", f"Designed by: {tc['designed_by']}"),
            (f"Execution Date: {tc['date']}", f"Executed by: {tc['executed_by']}"),
            (f"Short Description: {tc['description']}", None),
        ]

        for r_idx, (col0, col1) in enumerate(rows_spec):
            if col1 is None:
                htbl.rows[r_idx].cells[0].merge(htbl.rows[r_idx].cells[1])
                cell = htbl.rows[r_idx].cells[0]
                cell.text = col0
                set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
                set_cell_width(cell, 7.0)
                set_cell_shading(cell, "F8FAFC")
                txt = cell.paragraphs[0].runs[0].text
                prefix = txt.split(":")[0] + ":"
                rest = txt[len(prefix):]
                cell.paragraphs[0].text = ""
                r1 = cell.paragraphs[0].add_run(prefix)
                r1.font.bold = True
                r1.font.name = "Calibri"
                r1.font.size = Pt(9.5)
                r2 = cell.paragraphs[0].add_run(rest)
                r2.font.name = "Calibri"
                r2.font.size = Pt(9.5)
            else:
                for c_idx, val in enumerate([col0, col1]):
                    cell = htbl.rows[r_idx].cells[c_idx]
                    cell.text = val
                    set_cell_margins(cell, top=70, bottom=70, left=100, right=100)
                    set_cell_width(cell, 3.5)
                    set_cell_shading(cell, "F8FAFC" if r_idx % 2 == 0 else "FFFFFF")
                    txt = cell.paragraphs[0].runs[0].text
                    prefix = txt.split(":")[0] + ":"
                    rest = txt[len(prefix):]
                    cell.paragraphs[0].text = ""
                    r1 = cell.paragraphs[0].add_run(prefix)
                    r1.font.bold = True
                    r1.font.name = "Calibri"
                    r1.font.size = Pt(9.5)
                    r2 = cell.paragraphs[0].add_run(rest)
                    r2.font.name = "Calibri"
                    r2.font.size = Pt(9.5)

        # Pre-conditions
        pre_p = doc.add_paragraph()
        pre_p.paragraph_format.space_before = Pt(4)
        pre_p.paragraph_format.space_after = Pt(2)
        pr_run = pre_p.add_run("Pre-conditions:")
        pr_run.font.bold = True
        pr_run.font.name = "Calibri"
        pr_run.font.size = Pt(10)

        for prec in tc["preconditions"]:
            p_item = doc.add_paragraph(style='List Bullet')
            p_item.paragraph_format.space_after = Pt(1)
            p_item.paragraph_format.space_before = Pt(0)
            irun = p_item.add_run(prec)
            irun.font.name = "Calibri"
            irun.font.size = Pt(9)

        # Steps Table
        stbl = doc.add_table(rows=len(tc["steps"]) + 1, cols=5)
        set_table_borders(stbl, "CBD5E1")
        stbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        step_widths = [0.5, 1.9, 2.3, 0.7, 1.6]

        headers = ["Step", "Action", "Expected System Response", "Pass/Fail", "Comment"]
        for c_idx, head_text in enumerate(headers):
            cell = stbl.rows[0].cells[c_idx]
            cell.text = head_text
            set_cell_margins(cell, top=90, bottom=90, left=70, right=70)
            set_cell_width(cell, step_widths[c_idx])
            set_cell_shading(cell, "E2E8F0")
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3] else WD_ALIGN_PARAGRAPH.LEFT
            run = p.runs[0]
            run.font.bold = True
            run.font.name = "Calibri"
            run.font.size = Pt(9)

        for s_idx, (step_num, action, expected, pf, comment) in enumerate(tc["steps"]):
            row = stbl.rows[s_idx + 1]
            bg = "F8FAFC" if s_idx % 2 == 0 else "FFFFFF"

            row.cells[0].text = str(step_num)
            row.cells[1].text = action
            row.cells[2].text = expected
            row.cells[3].text = pf
            row.cells[4].text = comment

            for c_idx in range(5):
                cell = row.cells[c_idx]
                set_cell_margins(cell, top=70, bottom=70, left=70, right=70)
                set_cell_width(cell, step_widths[c_idx])
                set_cell_shading(cell, bg)
                p = cell.paragraphs[0]
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER if c_idx in [0, 3] else WD_ALIGN_PARAGRAPH.LEFT
                run = p.runs[0]
                run.font.name = "Calibri"
                run.font.size = Pt(8.5)
                if c_idx == 3 and pf == "Pass":
                    run.font.bold = True
                    run.font.color.rgb = RGBColor(0x16, 0x65, 0x34)

        # Post-conditions
        post_p = doc.add_paragraph()
        post_p.paragraph_format.space_before = Pt(4)
        post_p.paragraph_format.space_after = Pt(2)
        po_run = post_p.add_run("Post-conditions:")
        po_run.font.bold = True
        po_run.font.name = "Calibri"
        po_run.font.size = Pt(10)

        for postc in tc["postconditions"]:
            p_item = doc.add_paragraph(style='List Bullet')
            p_item.paragraph_format.space_after = Pt(1)
            p_item.paragraph_format.space_before = Pt(0)
            irun = p_item.add_run(postc)
            irun.font.name = "Calibri"
            irun.font.size = Pt(9)

        doc.add_paragraph().paragraph_format.space_after = Pt(6)

    # Save document
    doc.save(output_path)
    print(f"Successfully generated {output_path}")

def generate_markdown_spec(output_md_path):
    lines = [
        "# SchemeSaathi: System Test Case Specification",
        "**Document Code**: Doc: T_01  ",
        "**Standard Template**: Dr. Ghazy Assassa Test Case Specification Standard  ",
        "**System**: SchemeSaathi (AI-Powered Citizen Welfare Discovery Platform)  ",
        "**Date**: 20 November 2026 | **Version**: 2.1 | **Scope**: 6 Core High-Impact Test Cases | **Status**: Verified  ",
        "",
        "---",
        "",
        "## 1. Test Case Template (Doc: T_01)",
        "",
        "| Field | Value | Field | Value |",
        "|---|---|---|---|",
        "| **Test Case Name:** | [Name of the test case] | **Test Case #:** | [e.g. TC-01] |",
        "| **Subsystem:** | [Subsystem Name] | **System:** | SchemeSaathi |",
        "| **Design Date:** | DD/MM/YYYY | **Designed by:** | [QA Role / Engineer] |",
        "| **Execution Date:** | DD/MM/YYYY | **Executed by:** | [Tester Name / CI] |",
        "| **Short Description:** | [Concise statement of test objective] | | |",
        "",
        "**Pre-conditions:**",
        "- [Prerequisite system state, user credentials, loaded datasets, or network status]",
        "",
        "| Step | Action | Expected System Response | Pass/Fail | Comment |",
        "|---|---|---|---|---|",
        "| 1 | [Action 1] | [Expected Response 1] | Pass/Fail | [Notes] |",
        "| 2 | [Action 2] | [Expected Response 2] | Pass/Fail | [Notes] |",
        "",
        "**Post-conditions:**",
        "1. [Expected state of the database, session storage, or UI after test completion]",
        "",
        "---",
        "",
        "## 2. Core Test Suite & Traceability Matrix",
        "",
        "| Test # | Subsystem | Test Case Name | Type | Priority | Status |",
        "|---|---|---|---|---|---|",
    ]

    for tc in TEST_CASES:
        t_type = tc.get("type", "Functional")
        prio = tc.get("priority", "High")
        lines.append(f"| **{tc['id']}** | {tc['subsystem']} | {tc['name']} | {t_type} | {prio} | 🟢 Pass |")

    lines.extend([
        "",
        "---",
        "",
        "## 3. Comprehensive SchemeSaathi Test Case Specifications",
        ""
    ])

    for tc in TEST_CASES:
        lines.append(f"### {tc['id']}: {tc['name']}")
        lines.append("")
        lines.append("| Field | Value | Field | Value |")
        lines.append("|---|---|---|---|")
        lines.append(f"| **Test Case Name:** | {tc['name']} | **Test Case #:** | {tc['id']} |")
        lines.append(f"| **Subsystem:** | {tc['subsystem']} | **System:** | SchemeSaathi |")
        lines.append(f"| **Design Date:** | {tc['date']} | **Designed by:** | {tc['designed_by']} |")
        lines.append(f"| **Execution Date:** | {tc['date']} | **Executed by:** | {tc['executed_by']} |")
        lines.append(f"| **Short Description:** | {tc['description']} | | |")
        lines.append("")
        lines.append("**Pre-conditions:**")
        for prec in tc['preconditions']:
            lines.append(f"- {prec}")
        lines.append("")
        lines.append("| Step | Action | Expected System Response | Pass/Fail | Comment |")
        lines.append("|---|---|---|---|---|")
        for s in tc['steps']:
            act = s[1].replace('\n', '<br>')
            exp = s[2].replace('\n', '<br>')
            comm = s[4].replace('\n', '<br>')
            lines.append(f"| {s[0]} | {act} | {exp} | **{s[3]}** | {comm} |")
        lines.append("")
        lines.append("**Post-conditions:**")
        for p_idx, postc in enumerate(tc['postconditions'], 1):
            lines.append(f"{p_idx}. {postc}")
        lines.append("")
        lines.append("---")
        lines.append("")

    with open(output_md_path, 'w', encoding='utf-8') as f:
        f.write("\n".join(lines))
    print(f"Successfully generated {output_md_path}")

if __name__ == "__main__":
    out1 = "Test Case Template (3).docx"
    out2 = os.path.join("docs", "SchemeSaathi_Test_Cases.docx")
    out3 = os.path.join("docs", "TEST_CASES.md")
    create_test_cases_document(out1)
    create_test_cases_document(out2)
    generate_markdown_spec(out3)
