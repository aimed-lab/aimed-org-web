#!/usr/bin/env python3
"""Parse trainee data from CV and cross-reference with publications."""

import json
import re
import sys
from docx import Document

CV_PATH = "/Users/jakechen/Library/CloudStorage/Box-Box/My Profession/CV & Biosketch/Current CV/CV Jake Chen Feb 2026.docx"
PUBS_PATH = "/Users/jakechen/Library/CloudStorage/Box-Box/My Profession/My Lab/Portal/aimed-lab.org/scripts/cv_publications.json"
OUTPUT_PATH = "/Users/jakechen/Library/CloudStorage/Box-Box/My Profession/My Lab/Portal/aimed-lab.org/scripts/cv_trainees.json"

# Chinese institutions to exclude (except Peking University)
CHINA_EXCLUDE = [
    "wenzhou", "zhejiang", "guangzhou", "huazhong", "harbin",
    "shandong", "tsinghua", "northeastern university",
]
CHINA_ALLOW = ["peking"]

# Manual fixes for entries where tab separators are missing in the docx
# Key: partial text match -> (name, degree)
MANUAL_FIXES = {
    "Huu Phong Ngyen": ("Huu Phong Nguyen", "PhD in Computer Science, University of Coimbra, Portugal"),
    "Noha Sharafeldin": ("Noha Sharafeldin", "MD/PhD K33 Candidate, UAB Institute for Cancer Outcomes and Survivorship"),
    "Delower Mohammad": ("Delower Hossain", "PhD in Computer Science"),
    "Radomir Slominski": ("Radomir Slominski", "MD, PhD in Genetics, Genomics, and Bioinformatics, UAB"),
    "Madhura Kshirsagar": ("Madhura Kshirsagar", "MS in Bioinformatics, Indiana University"),
    "Sandeep Shantharam": ("Sandeep Shantharam", "MS in Bioinformatics, Indiana University"),
    "Chayaporn Suphavilai": ("Chayaporn Suphavilai", "MS in Computer Science, Purdue University"),
    "Madhankumar Sonachalam": ("Madhankumar Sonachalam", "MS in Bioinformatics, Indiana University"),
    "Christian T. Stackhouse": ("Christian T. Stackhouse", "PhD in Neuroscience, UAB"),
    "Prahasith Veluvolu": ("Prahasith Veluvolu", "Senior, Park Tudor High School, Indianapolis, Indiana"),
    "Ehsan Saghpour": ("Ehsan Saghapour", None),  # Fix name spelling only
    "Kevin Song, MS": ("Kevin Song", "PhD in Biomedical Engineering (Bioinformatics Concentration)"),
}


def is_china_institution(text):
    """Check if institution is Chinese (excluding Peking University)."""
    lower = text.lower()
    for allowed in CHINA_ALLOW:
        if allowed in lower:
            return False
    for excluded in CHINA_EXCLUDE:
        if excluded in lower:
            return True
    if ", china" in lower:
        return True
    return False


def parse_years(text):
    """Extract year range from text like '(2020 - 2023)' or '(Current)'."""
    text = text.strip()
    current = "current" in text.lower() or "present" in text.lower()
    years_match = re.findall(r'(\d{4})', text)
    if years_match:
        if len(years_match) > 1 and years_match[0] != years_match[-1]:
            return f"{years_match[0]}-{years_match[-1]}", current
        return years_match[0], current
    return "", current


def clean_name(name):
    """Clean up trainee name, removing Dr. prefix and extra whitespace."""
    name = name.strip()
    name = re.sub(r'^Dr\.\s*', '', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def apply_manual_fix(name, degree):
    """Apply manual fixes for known parsing issues."""
    for key, (fixed_name, fixed_degree) in MANUAL_FIXES.items():
        if key in name:
            return fixed_name, fixed_degree if fixed_degree else degree
    return name, degree


def get_last_name(name):
    parts = name.strip().split()
    return parts[-1] if parts else ""


def get_first_name(name):
    parts = name.strip().split()
    return parts[0] if parts else ""


def count_publications(trainee_name, publications):
    """Count co-authored publications by matching trainee name in author lists."""
    last = get_last_name(trainee_name)
    first = get_first_name(trainee_name)
    if not last or not first:
        return 0

    count = 0
    first_initial = first[0].upper()

    for pub in publications:
        authors = pub.get("authors", "")
        if not authors:
            continue
        if not re.search(r'\b' + re.escape(last) + r'\b', authors, re.IGNORECASE):
            continue
        author_parts = re.split(r',|and\s+', authors)
        for part in author_parts:
            part = part.strip()
            if re.search(r'\b' + re.escape(last) + r'\b', part, re.IGNORECASE):
                if re.search(r'\b' + re.escape(first) + r'\b', part, re.IGNORECASE):
                    count += 1
                    break
                elif re.search(r'\b' + re.escape(first_initial) + r'[\.\s]', part):
                    count += 1
                    break
                elif len(first) >= 3 and re.search(r'\b' + re.escape(first[:3]), part, re.IGNORECASE):
                    count += 1
                    break
    return count


def split_name_from_degree(text):
    """Try to split a name from degree info when they're concatenated without tab.

    Looks for degree keywords like 'PhD', 'MS ', 'MD', 'Senior,', etc.
    """
    # Try splitting at degree keywords
    patterns = [
        r'\s+(PhD\s)',
        r'\s+(MS\s+in\s)',
        r'\s+(MD[/,])',
        r'\s+(MD\s+)',
        r'\s+(Senior,\s)',
        r'\s+(Sophomore,\s)',
        r'\s+(Junior,\s)',
    ]
    for pat in patterns:
        m = re.search(pat, text)
        if m:
            name = text[:m.start()].strip()
            degree = text[m.start():].strip()
            return name, degree
    return text, ""


def parse_entry(text, next_text=None):
    """Parse a single trainee entry, handling tab-separated and concatenated formats."""
    # Check if next line is just a year in parens
    full_text = text
    used_next = False
    if next_text and re.match(r'^\(\d{4}', next_text.strip()) and '\t' not in next_text:
        full_text = text + "\t" + next_text.strip()
        used_next = True

    # Split by tabs
    parts = re.split(r'\t+', full_text)

    if len(parts) >= 3:
        name = clean_name(parts[0])
        degree = parts[1].strip()
        year_str = parts[2].strip()
    elif len(parts) == 2:
        name = clean_name(parts[0])
        degree = parts[1].strip()
        year_str = parts[1].strip()
    else:
        # No tabs at all - try to split name from degree
        name, degree = split_name_from_degree(clean_name(full_text))
        year_str = full_text

    # Extract years from year string or degree
    years, current = parse_years(year_str)
    if not years and not current:
        years, current = parse_years(degree)
    if not years and not current:
        years, current = parse_years(full_text)

    # Clean up degree - remove year portion if it's just "(year)"
    if re.match(r'^\([^)]*\d{4}[^)]*\)$', degree.strip()):
        degree = ""
    # Remove trailing year patterns from degree
    degree = re.sub(r'\s*\([^)]*\d{4}[^)]*\)\s*$', '', degree).strip()

    # Apply manual fixes
    name, degree = apply_manual_fix(name, degree)

    # Extract institution from degree
    institution = ""
    if degree and "," in degree:
        inst_part = degree.split(",", 1)[1].strip()
        institution = inst_part

    return {
        "name": name,
        "degree": degree,
        "institution": institution,
        "years": years,
        "current": current,
    }, used_next


def parse_section(paragraphs, start, end, role, skip_headers=None):
    """Generic section parser."""
    trainees = []
    skip_headers = skip_headers or []
    i = start
    while i < end:
        text = paragraphs[i].text.strip()
        if not text:
            i += 1
            continue

        # Skip header lines
        skip = False
        for h in skip_headers:
            if h in text:
                skip = True
                break
        # Skip achievement/note lines
        if text.startswith("Won ") or text.startswith("Co-founded") or text.startswith("Participated") or text.startswith("Accepted") or text.startswith("Internship"):
            skip = True

        if skip:
            i += 1
            continue

        next_text = paragraphs[i + 1].text.strip() if i + 1 < end else None
        entry, used_next = parse_entry(text, next_text)
        entry["role"] = role
        trainees.append(entry)

        if used_next:
            i += 2
        else:
            i += 1

    return trainees


def main():
    doc = Document(CV_PATH)
    paragraphs = doc.paragraphs

    with open(PUBS_PATH) as f:
        publications = json.load(f)

    all_trainees = []

    # Postdocs: 817-834
    postdocs = parse_section(paragraphs, 817, 835, "Postdoc",
                             skip_headers=["Postdoctoral", "Fellow Supervision"])
    all_trainees.extend(postdocs)

    # Graduate advisor/chair: 837-873
    grads = parse_section(paragraphs, 837, 874, "__auto_grad__",
                          skip_headers=["As Thesis", "Graduate Research"])
    # Auto-detect PhD vs MS role
    for t in grads:
        if "PhD" in t["degree"] or "PhD" in t["name"]:
            t["role"] = "PhD"
        else:
            t["role"] = "MS"
    all_trainees.extend(grads)

    # Co-advisor: 875-878
    coadv = parse_section(paragraphs, 875, 879, "PhD",
                          skip_headers=["As Thesis"])
    for t in coadv:
        t["degree"] = t["degree"] + " (co-advised)" if t["degree"] else "(co-advised)"
    all_trainees.extend(coadv)

    # Committee member: 880-897
    committee = parse_section(paragraphs, 880, 898, "__auto_committee__",
                              skip_headers=["As Thesis"])
    for t in committee:
        base = "PhD" if "PhD" in t["degree"] or "PhD" in t["name"] or "MD" in t["degree"] else "MS"
        t["role"] = f"{base} (committee)"
    all_trainees.extend(committee)

    # Undergrad: 899-914
    undergrads = parse_section(paragraphs, 899, 915, "Undergrad",
                               skip_headers=["Undergraduate"])
    all_trainees.extend(undergrads)

    # High school: 916-923
    highschool = parse_section(paragraphs, 916, 924, "High School",
                               skip_headers=["High-School"])
    all_trainees.extend(highschool)

    # Filter out China institutions (except Peking)
    filtered = []
    for t in all_trainees:
        combined = t["degree"] + " " + t["institution"]
        if is_china_institution(combined):
            print(f"  EXCLUDED (China): {t['name']} - {t['degree']}", file=sys.stderr)
            continue
        filtered.append(t)

    # Cross-reference with publications
    for t in filtered:
        t["pubCount"] = count_publications(t["name"], publications)

    # Deduplicate: if same person appears in multiple roles, keep highest role
    # (e.g., Zongliang Yue appears as MS, PhD, and Postdoc)
    # We keep all entries but note duplicates

    # Print summary
    roles = {}
    for t in filtered:
        r = t["role"]
        roles[r] = roles.get(r, 0) + 1

    print(f"Total trainees: {len(filtered)}", file=sys.stderr)
    for r, c in sorted(roles.items()):
        print(f"  {r}: {c}", file=sys.stderr)

    print("\nTrainees with publications:", file=sys.stderr)
    for t in filtered:
        if t["pubCount"] > 0:
            print(f"  {t['name']} ({t['role']}): {t['pubCount']} pubs", file=sys.stderr)

    # Debug: print all entries for review
    print("\nAll entries:", file=sys.stderr)
    for t in filtered:
        print(f"  [{t['role']}] {t['name']} | {t['degree']} | {t['years']} | current={t['current']}", file=sys.stderr)

    with open(OUTPUT_PATH, "w") as f:
        json.dump(filtered, f, indent=2)

    print(f"\nSaved {len(filtered)} trainees to {OUTPUT_PATH}", file=sys.stderr)


if __name__ == "__main__":
    main()
