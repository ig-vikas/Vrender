export const DEFAULT_DOCUMENT_TITLE = "topics";

export const SAMPLE_MARKDOWN = `### 📊 Sample Table

| ID | Name | Score | Status |
| :---: | :--- | :---: | :---: |
| 01 | Alice | 92 | ✅ |
| 02 | Bob | 78 | ⚡ |
| 03 | Charlie | 65 | ❌ |
| 04 | Diana | 88 | ✅ |

### 💻 C++

\`\`\`cpp
#include <bits/stdc++.h>
using namespace std;

int main() {
    vector<int> a = {4, 1, 7, 2, 9};

    sort(a.begin(), a.end());

    for (int x : a)
        cout << x << ' ';

    return 0;
}
\`\`\`

#### Output
\`\`\`text
1 2 4 7 9
\`\`\`

### 🧮 Math

$$S = \\sum_{i=1}^{n} i = \\frac{n(n+1)}{2}$$

For $n = 10$:

$$S = \\frac{10 \\times 11}{2} = 55$$

### 📝 Quick List
* Arrays
* Graphs
* DP
* Greedy
* Binary Search
* Meet in the Middle

### 📦 JSON

\`\`\`json
{
  "name": "Climate",
  "rating": 1800,
  "active": true
}
\`\`\`

### 🖥️ Terminal

\`\`\`bash
git status
git add .
git commit -m "update"
git push
\`\`\`

### 🔢 Complexity

| Operation | Complexity |
| :--- | :--- |
| Array access | \`O(1)\` |
| Binary Search | \`O(log N)\` |
| Sorting | \`O(N log N)\` |
| Nested loops | \`O(N²)\` |

> Tip: Think first, code second. 🚀
`;
