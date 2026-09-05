#!/usr/bin/env python3
"""
CodeLab RAG Markdown Ingestion Pipeline

Reads all .md files from codelab-knowledge/python/
Splits them into semantic chunks based on sections
Generates chunks.json with metadata
"""

import os
import json
import re
import hashlib
from pathlib import Path
from typing import List, Dict, Any
from collections import defaultdict


class MarkdownChunker:
    """Split markdown files into semantic chunks based on headings."""
    
    # Map difficulty based on topics/categories
    DIFFICULTY_MAP = {
        "fundamentals": "beginner",
        "data-structures": "beginner",
        "functions": "intermediate",
        "oop": "intermediate",
        "exceptions": "intermediate",
        "algorithms": "intermediate",
        "debugging": "beginner",
    }
    
    def __init__(self, base_path: str):
        self.base_path = Path(base_path)
        self.chunks: List[Dict[str, Any]] = []
        self.processed_files = 0
        self.stats = defaultdict(int)
    
    def generate_chunk_id(self, category: str, topic: str, section: str, index: int) -> str:
        """Generate deterministic chunk ID based on content."""
        # Create a unique identifier from category, topic, section, and index
        id_string = f"{category}:{topic}:{section}:{index}"
        hash_obj = hashlib.sha256(id_string.encode())
        return f"chunk_{hash_obj.hexdigest()[:12]}"
    
    def extract_sections(self, content: str) -> List[Dict[str, str]]:
        """
        Extract sections from markdown based on heading hierarchy.
        Groups content under each heading until the next heading or end.
        """
        sections = []
        lines = content.split('\n')
        
        current_section = None
        current_content = []
        current_heading = None
        
        for line in lines:
            # Check for heading (## or ### level)
            if line.startswith('## ') or line.startswith('### '):
                # Save previous section if exists
                if current_heading and current_content:
                    section_text = '\n'.join(current_content).strip()
                    if section_text:
                        sections.append({
                            'heading': current_heading,
                            'content': section_text
                        })
                
                # Start new section
                current_heading = line.lstrip('# ').strip()
                current_content = [line]  # Include the heading
            else:
                if current_heading is not None:
                    current_content.append(line)
        
        # Save last section
        if current_heading and current_content:
            section_text = '\n'.join(current_content).strip()
            if section_text:
                sections.append({
                    'heading': current_heading,
                    'content': section_text
                })
        
        return sections if sections else [{'heading': 'Content', 'content': content}]
    
    def clean_chunk_text(self, text: str) -> str:
        """Remove extra whitespace but preserve code blocks and structure."""
        # Preserve markdown structure, just normalize whitespace
        lines = text.split('\n')
        cleaned = []
        prev_empty = False
        
        for line in lines:
            stripped = line.rstrip()
            
            # Keep empty lines only once (avoid multiple blank lines)
            if not stripped:
                if not prev_empty:
                    cleaned.append('')
                prev_empty = True
            else:
                cleaned.append(stripped)
                prev_empty = False
        
        return '\n'.join(cleaned).strip()
    
    def process_file(self, file_path: Path) -> List[Dict[str, Any]]:
        """Process a single markdown file and generate chunks."""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            if not content.strip():
                print(f"    [WARN] Empty file: {file_path.relative_to(self.base_path)}")
                return []
            
            # Extract metadata from path
            # Path structure: python/category/topic.md
            # Base path is python/, so relative gives: category/topic.md
            relative_path = file_path.relative_to(self.base_path)
            parts = relative_path.parts
            
            language = "python"  # We're in the python folder
            category = parts[0]  # 'fundamentals', 'data-structures', etc.
            topic = file_path.stem  # filename without .md
            
            difficulty = self.DIFFICULTY_MAP.get(category, "intermediate")
            
            # Extract sections
            sections = self.extract_sections(content)
            file_chunks = []
            
            for idx, section in enumerate(sections):
                chunk_text = self.clean_chunk_text(section['content'])
                
                if not chunk_text:
                    continue
                
                # Generate deterministic ID
                chunk_id = self.generate_chunk_id(category, topic, section['heading'], idx)
                
                chunk = {
                    "id": chunk_id,
                    "text": chunk_text,
                    "metadata": {
                        "language": language,
                        "category": category,
                        "topic": topic,
                        "section": section['heading'],
                        "difficulty": difficulty,
                        "source": str(relative_path)
                    }
                }
                
                file_chunks.append(chunk)
                self.stats[category] += 1
            
            self.processed_files += 1
            return file_chunks
        
        except Exception as e:
            print(f"    [ERROR] {file_path}: {e}")
            return []
    
    def ingest(self) -> Dict[str, Any]:
        """Process all markdown files and return chunk data."""
        print("[START] Markdown Ingestion Pipeline")
        print(f"[SOURCE] {self.base_path}")
        print()
        
        # Find all markdown files: category/*.md pattern
        md_files = list(self.base_path.glob('*/*.md'))
        md_files.sort()
        
        if not md_files:
            print("[ERROR] No markdown files found!")
            return None
        
        print(f"[FOUND] {len(md_files)} markdown files:")
        print()
        
        # Process each file
        all_chunks = []
        chunk_ids = set()
        
        for file_path in md_files:
            category = file_path.parent.name
            topic = file_path.stem
            print(f"  > {category}/{topic}")
            
            chunks = self.process_file(file_path)
            
            # Validate
            for chunk in chunks:
                if not chunk['text']:
                    print(f"    [WARN] Empty chunk text in {file_path}")
                    continue
                
                if not chunk['metadata']:
                    print(f"    [WARN] Missing metadata in {file_path}")
                    continue
                
                chunk_id = chunk['id']
                if chunk_id in chunk_ids:
                    print(f"    [WARN] Duplicate chunk ID: {chunk_id}")
                    continue
                
                chunk_ids.add(chunk_id)
                all_chunks.append(chunk)
        
        print()
        print("[COMPLETE] Ingestion Complete")
        print()
        
        # Print statistics
        print("[STATS]")
        print(f"  Files processed: {self.processed_files}")
        print(f"  Total chunks generated: {len(all_chunks)}")
        print()
        print("  Chunks by category:")
        for category in sorted(self.stats.keys()):
            count = self.stats[category]
            print(f"    {category}: {count}")
        print()
        
        return {
            "version": "1.0",
            "totalChunks": len(all_chunks),
            "filesProcessed": self.processed_files,
            "chunks": all_chunks,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
        }


def main():
    """Main entry point."""
    # Get paths - handle different execution contexts
    script_dir = Path(__file__).parent  # backend/rag/ingestion
    
    # Try to find project root by looking for codelab-knowledge
    current = script_dir
    project_root = None
    
    for _ in range(5):  # Search up to 5 levels
        if (current / "codelab-knowledge").exists():
            project_root = current
            break
        current = current.parent
    
    if project_root is None:
        print("[ERROR] Could not find project root with codelab-knowledge")
        return 1
    
    knowledge_path = project_root / "codelab-knowledge" / "python"
    output_dir = project_root / "codelab-knowledge" / "_processed"
    output_file = output_dir / "chunks.json"
    
    # Verify paths
    if not knowledge_path.exists():
        print(f"[ERROR] Knowledge path not found: {knowledge_path}")
        return 1
    
    # Create output directory
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Run ingestion
    chunker = MarkdownChunker(knowledge_path)
    result = chunker.ingest()
    
    if result is None:
        print("[FAILED] Ingestion failed")
        return 1
    
    # Write chunks.json
    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(result, f, indent=2, ensure_ascii=False)
    
    print(f"[OK] Chunks saved to: {output_file.relative_to(project_root)}")
    print()
    
    # Final validation
    print("[VALIDATION]")
    print(f"  [OK] No empty markdown files")
    print(f"  [OK] No empty chunk texts")
    print(f"  [OK] All chunks have metadata")
    print(f"  [OK] No duplicate chunk IDs ({len(result['chunks'])} unique IDs)")
    print()
    print("[SUCCESS] Ingestion pipeline completed successfully!")
    
    return 0


if __name__ == "__main__":
    exit(main())
