// add-problems.js
// Run with: mongosh <your-db-name> add-problems.js

db.problems.insertMany([
    {
        _id: ObjectId('68a09c06e997c7fa34ec8600'),
        title: 'Reverse Linked List',
        difficulty: 1200,
        description: 'Given the `head` of a singly linked list, reverse the list, and return the reversed list.\r\n\r\nNote: A linked list is a linear data structure where elements are not stored at contiguous memory locations. It consists of nodes where each node contains a data field and a reference (link) to the next node in the sequence.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'The input will be a space-separated list of integers representing the nodes of the linked list.',
        outputFormat: 'Output a space-separated list of integers representing the nodes of the reversed linked list.',
        sampleTestcases: [
            { input: '1 2 3 4 5', output: '5 4 3 2 1' },
            { input: '1 2', output: '2 1' },
            { input: ' ', output: ' ' }
        ],
        constraints: 'The number of nodes in the list is in the range [0, 5000].\r\n-5000 <= Node.val <= 5000',
        tags: ['"linked-list', 'recursion', 'iteration"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nReversing a singly linked list is a classic problem that can be solved with an iterative or a recursive approach. The most common and memory-efficient method is the iterative one.\r\n\r\n### Iterative Approach\r\n1.  **Initialize Pointers:** We need three pointers: `prev`, `current`, and `nextTemp`. \r\n    * `prev` will point to the previously processed node. It starts as `nullptr` because the new head of the reversed list will point to `nullptr`.\r\n    * `current` starts at `head`, pointing to the node we are currently processing.\r\n    * `nextTemp` will temporarily store the next node in the original list before we reverse the current node\'s pointer.\r\n\r\n2.  **Iterate and Reverse:** Loop through the list as long as `current` is not `nullptr`. Inside the loop:\r\n    * Store the next node: `nextTemp = current->next`.\r\n    * Reverse the current node\'s pointer: `current->next = prev`.\r\n    * Move the pointers forward: `prev = current`, then `current = nextTemp`.\r\n\r\n3.  **Return the New Head:** After the loop, `prev` points to the new head. Return `prev`.\r\n\r\n### Complexity\r\n* **Time Complexity:** O(n)\r\n* **Space Complexity:** O(1)',
        editorialLink: 'https://www.youtube.com/watch?v=ENV_KsTuvcI',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <string>\r\n#include <sstream>\r\n#include <algorithm>\r\n\r\nstruct ListNode {\r\n    int val;\r\n    ListNode *next;\r\n    ListNode(int x) : val(x), next(NULL) {}\r\n};\r\n\r\nListNode* reverseList(ListNode* head) {\r\n    ListNode* prev = nullptr;\r\n    ListNode* current = head;\r\n    while (current != nullptr) {\r\n        ListNode* nextTemp = current->next;\r\n        current->next = prev;\r\n        prev = current;\r\n        current = nextTemp;\r\n    }\r\n    return prev;\r\n}\r\n\r\nListNode* createList(const std::string& s) {\r\n    if (s.empty() || s == " ") return nullptr;\r\n    std::stringstream ss(s);\r\n    int val;\r\n    ListNode* head = nullptr;\r\n    ListNode* tail = nullptr;\r\n    while (ss >> val) {\r\n        if (!head) { head = new ListNode(val); tail = head; }\r\n        else { tail->next = new ListNode(val); tail = tail->next; }\r\n    }\r\n    return head;\r\n}\r\n\r\nvoid printList(ListNode* head) {\r\n    if (!head) return;\r\n    while (head) {\r\n        std::cout << head->val << (head->next ? " " : "");\r\n        head = head->next;\r\n    }\r\n    std::cout << std::endl;\r\n}\r\n\r\nint main() {\r\n    std::string input;\r\n    std::getline(std::cin, input);\r\n    ListNode* head = createList(input);\r\n    ListNode* reversedHead = reverseList(head);\r\n    printList(reversedHead);\r\n    return 0;\r\n}',
        hints: [
            {
                title: 'Hints Unavailable',
                content: "We couldn't generate hints for this problem at the moment. Please try again later or check the editorial."
            }
        ],
        createdAt: new Date('2025-08-16T14:56:06.560Z'),
        updatedAt: new Date('2025-08-17T05:59:33.395Z'),
        __v: 1
    },
    {
        _id: ObjectId('68a18efb5c751391cf7bcc0b'),
        title: 'Merge Two Sorted Lists',
        difficulty: 1100,
        description: 'You are given the heads of two sorted linked lists `list1` and `list2`. Merge the two lists into a single sorted linked list. The list should be made by splicing together the nodes of the first two lists.\r\n\r\nReturn the head of the merged linked list.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'The input will consist of two lines, each containing a space-separated list of integers representing the nodes of the two sorted linked lists. An empty list is represented by a single space.',
        outputFormat: 'Output a space-separated list of integers representing the nodes of the merged sorted linked list.',
        sampleTestcases: [
            { input: '1 2 4\n1 3 4', output: '1 1 2 3 4 4' },
            { input: ' \n ', output: ' ' },
            { input: ' ', output: '0' },
            { input: '1 2 3\n ', output: '1 2 3' }
        ],
        constraints: 'The number of nodes in both lists is in the range [0, 50].\r\n-100 <= Node.val <= 100\r\nBoth `list1` and `list2` are sorted in non-decreasing order.',
        tags: ['"linked-list', 'recursion', 'iteration"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nThis problem can be solved iteratively or recursively. The iterative approach is often preferred for its better space complexity.\r\n\r\n### Iterative Approach with Dummy Node\r\n1.  **Create a Dummy Node:** Use a dummy node as the starting point and a `current` pointer as the tail.\r\n2.  **Iterate and Compare:** While both lists are non-null, append the smaller node to `current->next` and advance that list.\r\n3.  **Advance `current`:** Move `current` to the newly appended node.\r\n4.  **Append Remaining Nodes:** Attach whichever list is non-null.\r\n5.  **Return `dummy->next`.**\r\n\r\n### Complexity\r\n* **Time Complexity:** O(m + n)\r\n* **Space Complexity:** O(1)',
        editorialLink: 'https://www.youtube.com/watch?v=XIdigk956u0',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <string>\r\n#include <sstream>\r\n\r\nstruct ListNode {\r\n    int val;\r\n    ListNode *next;\r\n    ListNode(int x) : val(x), next(NULL) {}\r\n};\r\n\r\nListNode* mergeTwoLists(ListNode* l1, ListNode* l2) {\r\n    ListNode* dummy = new ListNode(0);\r\n    ListNode* current = dummy;\r\n    while (l1 != nullptr && l2 != nullptr) {\r\n        if (l1->val <= l2->val) { current->next = l1; l1 = l1->next; }\r\n        else { current->next = l2; l2 = l2->next; }\r\n        current = current->next;\r\n    }\r\n    if (l1 != nullptr) current->next = l1;\r\n    else if (l2 != nullptr) current->next = l2;\r\n    return dummy->next;\r\n}\r\n\r\nListNode* createList(const std::string& s) {\r\n    if (s.empty() || s == " ") return nullptr;\r\n    std::stringstream ss(s);\r\n    int val;\r\n    ListNode* head = nullptr;\r\n    ListNode* tail = nullptr;\r\n    while (ss >> val) {\r\n        if (!head) { head = new ListNode(val); tail = head; }\r\n        else { tail->next = new ListNode(val); tail = tail->next; }\r\n    }\r\n    return head;\r\n}\r\n\r\nvoid printList(ListNode* head) {\r\n    if (!head) return;\r\n    while (head) {\r\n        std::cout << head->val << (head->next ? " " : "");\r\n        head = head->next;\r\n    }\r\n    std::cout << std::endl;\r\n}\r\n\r\nint main() {\r\n    std::string s1, s2;\r\n    std::getline(std::cin, s1);\r\n    std::getline(std::cin, s2);\r\n    ListNode* list1 = createList(s1);\r\n    ListNode* list2 = createList(s2);\r\n    printList(mergeTwoLists(list1, list2));\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Understanding the Merging Process', content: "You are given two *sorted* linked lists. To create a new merged sorted list, you'll need to compare elements from both input lists. Think about how you would pick the very first element of your merged list." },
            { title: 'Hint 2: Building the New List Structure', content: "A common technique when constructing a linked list is to use a 'dummy' head node. You'll also need a 'current' pointer to keep track of where to append the next node efficiently." },
            { title: 'Hint 3: The Core Logic - Iterative Comparison and Appending', content: "Use a loop that continues as long as there are elements in *either* list. Inside the loop, compare the values of the current nodes and append the smaller one. Don't forget to advance the pointer of the list from which you took the node." },
            { title: 'Hint 4: Considering a Recursive Solution', content: 'Think about the base cases: what happens if `list1` is empty? What if `list2` is empty? For the recursive step, the node with the smaller value will be the head of your current merged sublist, and its `next` pointer points to the result of recursively merging the rest.' }
        ],
        createdAt: new Date('2025-08-17T08:12:43.318Z'),
        updatedAt: new Date('2026-04-01T12:17:38.448Z'),
        testcases: [],
        __v: 1
    },
    {
        _id: ObjectId('68a18f635c751391cf7bcc28'),
        title: 'Best Time to Buy and Sell Stock',
        difficulty: 1200,
        description: 'You are given an array `prices` where `prices[i]` is the price of a given stock on the `i`-th day. You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.\r\n\r\nReturn the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return 0.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'The input will be a single line containing space-separated integers representing the stock prices.',
        outputFormat: 'Output a single integer representing the maximum profit.',
        sampleTestcases: [
            { input: '7 1 5 3 6 4', output: '5' },
            { input: '7 6 4 3 1', output: '0' }
        ],
        constraints: '1 <= prices.length <= 10^5\r\n0 <= prices[i] <= 10^4',
        tags: ['"array', 'dynamic-programming', 'greedy"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nThis problem can be solved with a single pass through the array. The core idea is to keep track of the minimum price encountered so far and calculate potential profit at each step.\r\n\r\n### Single-Pass Greedy Algorithm\r\n1.  **Initialize Variables:** `minPrice = INT_MAX`, `maxProfit = 0`.\r\n2.  **Iterate Through Prices:** For each price, update `minPrice` if lower, else update `maxProfit` if profit is higher.\r\n3.  **Return `maxProfit`.**\r\n\r\n### Complexity\r\n* **Time Complexity:** O(n)\r\n* **Space Complexity:** O(1)',
        editorialLink: 'https://www.youtube.com/watch?v=1pkOgXD63yU',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <sstream>\r\n#include <algorithm>\r\n\r\nint maxProfit(std::vector<int>& prices) {\r\n    int minPrice = INT_MAX;\r\n    int maxProf = 0;\r\n    for (int price : prices) {\r\n        if (price < minPrice) minPrice = price;\r\n        else if (price - minPrice > maxProf) maxProf = price - minPrice;\r\n    }\r\n    return maxProf;\r\n}\r\n\r\nint main() {\r\n    std::string line;\r\n    std::getline(std::cin, line);\r\n    std::stringstream ss(line);\r\n    std::vector<int> prices;\r\n    int price;\r\n    while (ss >> price) prices.push_back(price);\r\n    std::cout << maxProfit(prices) << std::endl;\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Brute Force Approach', content: 'Consider a brute-force approach where you iterate through all possible pairs of buy and sell days. For each pair, calculate the profit and keep track of the maximum profit encountered so far.' },
            { title: 'Hint 2: Optimizing for Efficiency', content: 'The brute-force approach has a time complexity of O(n^2). Can you improve this? Consider keeping track of the minimum price encountered so far while iterating through the array.' },
            { title: 'Hint 3: One-Pass Solution', content: 'Try to maintain a single variable to track the minimum price seen so far. As you iterate, compare the current price with the minimum price to calculate the potential profit.' },
            { title: 'Hint 4: Greedy Approach', content: "The problem can be solved efficiently using a greedy approach. At each day, maximize your profit by selling at the current price if it results in a larger profit than what you've already seen." },
            { title: 'Hint 5: Algorithm Structure', content: 'Initialize `min_price` and `max_profit`. Iterate through `prices`. Update `min_price` if a lower price is encountered. Calculate the potential profit and update `max_profit` if greater. Return `max_profit`.' }
        ],
        createdAt: new Date('2025-08-17T08:14:27.830Z'),
        updatedAt: new Date('2025-08-17T10:08:01.864Z'),
        __v: 1
    },
    {
        _id: ObjectId('68a18fba5c751391cf7bcc31'),
        title: 'Contains Duplicate',
        difficulty: 1000,
        description: 'Given an integer array `nums`, return `true` if any value appears at least twice in the array, and return `false` if every element is distinct.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'A single line containing space-separated integers representing the elements of the array `nums`.',
        outputFormat: 'Output a single boolean value: `true` or `false`.',
        sampleTestcases: [
            { input: '1 2 3 1', output: 'true' },
            { input: '1 2 3 4', output: 'false' },
            { input: '2 14 18 22 14', output: 'true' }
        ],
        constraints: '1 <= nums.length <= 10^5\r\n-10^9 <= nums[i] <= 10^9',
        tags: ['"array', 'hash-table', 'sorting"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nThe most efficient method utilizes a **hash set** to keep track of numbers already seen.\r\n\r\n### Hash Set Method\r\n1.  **Initialize a Hash Set.**\r\n2.  **Iterate Through the Array.**\r\n3.  **Check for Duplicates:** If the number is in the set, return `true`.\r\n4.  **Add to Set** if not found.\r\n5.  **Return `false`** if loop completes with no duplicates.\r\n\r\n### Complexity\r\n* **Time Complexity:** O(n)\r\n* **Space Complexity:** O(n)',
        editorialLink: 'https://www.youtube.com/watch?v=3iHn7KBuX-0',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <unordered_set>\r\n#include <string>\r\n#include <sstream>\r\n\r\nbool containsDuplicate(std::vector<int>& nums) {\r\n    std::unordered_set<int> seen;\r\n    for (int num : nums) {\r\n        if (seen.count(num)) return true;\r\n        seen.insert(num);\r\n    }\r\n    return false;\r\n}\r\n\r\nint main() {\r\n    std::string line;\r\n    std::getline(std::cin, line);\r\n    std::stringstream ss(line);\r\n    std::vector<int> nums;\r\n    int num;\r\n    while (ss >> num) nums.push_back(num);\r\n    std::cout << (containsDuplicate(nums) ? "true" : "false") << std::endl;\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Detecting Repetition', content: "The problem asks us to determine if any element appears *more than once*. We need a way to keep track of elements we've encountered so far and quickly check if the current element has been seen before." },
            { title: 'Hint 2: Leveraging Order', content: 'If the array elements were sorted, how would that make it easier to spot adjacent duplicates? Consider what happens when two identical numbers are placed next to each other after sorting.' },
            { title: 'Hint 3: Optimizing for Speed: Faster Lookups', content: 'While sorting works (O(N log N)), can we do better? Think about data structures designed for very quick O(1) average-case checks of whether an element already exists.' },
            { title: 'Hint 4: The Efficient Solution: Hash Sets', content: "Use a hash set. For every number, check if it's already present — if yes, return `true`. If not, add it. If you finish the array without a hit, return `false`." }
        ],
        createdAt: new Date('2025-08-17T08:15:54.990Z'),
        updatedAt: new Date('2025-12-11T16:44:53.901Z'),
        __v: 1
    },
    {
        _id: ObjectId('68a190225c751391cf7bcc43'),
        title: 'Valid Anagram',
        difficulty: 1000,
        description: 'Given two strings `s` and `t`, return `true` if `t` is an anagram of `s`, and `false` otherwise.\r\n\r\nAn **Anagram** is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'The input will consist of two lines. The first line contains string `s`, and the second line contains string `t`.',
        outputFormat: 'Output a single boolean value: `true` or `false`.',
        sampleTestcases: [
            { input: 'anagram\nnagaram', output: 'true' },
            { input: 'rat\ncar', output: 'false' }
        ],
        constraints: '1 <= s.length, t.length <= 5 * 10^4\r\n`s` and `t` consist of lowercase English letters.',
        tags: ['"string', 'hash-table', 'sorting"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nThe most efficient way is using a frequency count array of size 26 (one per lowercase letter).\r\n\r\n### Frequency Array Method\r\n1.  **Check Lengths:** Return `false` if lengths differ.\r\n2.  **Count Characters in `s`:** Increment `charCount[c - \'a\']`.\r\n3.  **Decrement for `t`:** Decrement `charCount[c - \'a\']`. Return `false` if it goes negative.\r\n4.  **Return `true`** if no issues.\r\n\r\n### Complexity\r\n* **Time Complexity:** O(n)\r\n* **Space Complexity:** O(1)',
        editorialLink: 'https://www.youtube.com/watch?v=9UtInBqnCgA',
        solution: '#include <iostream>\r\n#include <string>\r\n#include <vector>\r\n\r\nbool isAnagram(std::string s, std::string t) {\r\n    if (s.length() != t.length()) return false;\r\n    std::vector<int> charCount(26, 0);\r\n    for (char c : s) charCount[c - \'a\']++;\r\n    for (char c : t) {\r\n        charCount[c - \'a\']--;\r\n        if (charCount[c - \'a\'] < 0) return false;\r\n    }\r\n    return true;\r\n}\r\n\r\nint main() {\r\n    std::string s, t;\r\n    std::cin >> s >> t;\r\n    std::cout << (isAnagram(s, t) ? "true" : "false") << std::endl;\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Anagram Definition', content: 'Ensure you fully understand the definition of an anagram. Consider the length of the strings and the frequency of each character.' },
            { title: 'Hint 2: Character Frequency Analysis', content: 'Focus on the frequency of each character in both strings. If the strings are anagrams, what relationship must exist between the character frequencies of `s` and `t`?' },
            { title: 'Hint 3: Efficient Data Structure', content: 'Consider using a data structure that offers O(1) complexity for insertion and retrieval. Hash tables or fixed-size arrays are good candidates.' },
            { title: 'Hint 4: Algorithm Considerations', content: 'Count character frequencies for both strings and compare. Consider edge cases like strings of different lengths.' },
            { title: 'Hint 5: Optimization and Edge Cases', content: 'A simple length check is a quick way to eliminate many non-anagram cases early, before doing any character counting.' }
        ],
        createdAt: new Date('2025-08-17T08:17:38.920Z'),
        updatedAt: new Date('2025-08-17T08:18:19.218Z'),
        __v: 1
    },
    {
        _id: ObjectId('68a1fbdc769d7c89006a3635'),
        title: 'Longest Increasing Subsequence',
        difficulty: 1800,
        description: 'Given an integer array `nums`, return the length of the longest strictly increasing subsequence.\r\n\r\nA **subsequence** is a sequence that can be derived from an array by deleting some or no elements without changing the order of the remaining elements. For example, `[3,6,2,7]` is a subsequence of the array `[0,3,1,6,2,2,7]`.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'A single line containing space-separated integers representing the elements of the array `nums`.',
        outputFormat: 'Output a single integer representing the length of the longest increasing subsequence.',
        sampleTestcases: [
            { input: '10 9 2 5 3 7 101 18', output: '4' },
            { input: '0 1 0 3 2 3', output: '4' },
            { input: '7 7 7 7 7 7 7', output: '1' }
        ],
        constraints: '1 <= nums.length <= 2500\r\n-10^4 <= nums[i] <= 10^4',
        tags: ['"array', 'dynamic-programming', 'binary-search"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nAn efficient O(n log n) solution uses a `tails` array with binary search.\r\n\r\n### O(n log n) Solution\r\n1.  **Maintain a `tails` Array:** `tails[i]` is the smallest tail of all increasing subsequences of length `i+1`.\r\n2.  **For each `num`:** If greater than last element of `tails`, append it. Otherwise, binary search for the first element >= `num` and replace it.\r\n3.  **Return `tails.size()`.**\r\n\r\n### Complexity\r\n* **Time Complexity:** O(n log n)\r\n* **Space Complexity:** O(n)',
        editorialLink: 'https://www.youtube.com/watch?v=X88izvejTXI',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <string>\r\n#include <sstream>\r\n#include <algorithm>\r\n\r\nint lengthOfLIS(std::vector<int>& nums) {\r\n    if (nums.empty()) return 0;\r\n    std::vector<int> tails;\r\n    for (int num : nums) {\r\n        auto it = std::lower_bound(tails.begin(), tails.end(), num);\r\n        if (it == tails.end()) tails.push_back(num);\r\n        else *it = num;\r\n    }\r\n    return tails.size();\r\n}\r\n\r\nint main() {\r\n    std::string line;\r\n    std::getline(std::cin, line);\r\n    std::stringstream ss(line);\r\n    std::vector<int> nums;\r\n    int num;\r\n    while (ss >> num) nums.push_back(num);\r\n    std::cout << lengthOfLIS(nums) << std::endl;\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Understanding Subsequences and Initial DP Thoughts', content: "Define `dp[i]` as the length of the longest increasing subsequence ending at `nums[i]`. How would you compute `dp[i]` by looking at previous elements?" },
            { title: 'Hint 2: Developing the O(N^2) Dynamic Programming Solution', content: 'For each `nums[i]`, iterate through all `nums[j]` where `j < i`. If `nums[i] > nums[j]`, then `dp[i] = max(dp[i], dp[j] + 1)`. The answer is the max value in `dp`.' },
            { title: 'Hint 3: Towards a More Efficient Approach - Changing the DP State', content: "Instead of tracking LIS ending at each index, maintain a structure that for each LIS length `k` stores the *smallest ending element* of all such subsequences found so far." },
            { title: 'Hint 4: Implementing O(N log N) with Binary Search', content: "Maintain a sorted `tails` array. For each `num`, use binary search to find the first element >= `num` and replace it — or append if `num` is larger than all. The array length at the end is your answer." }
        ],
        createdAt: new Date('2025-08-17T15:57:16.902Z'),
        updatedAt: new Date('2025-11-05T03:45:13.558Z'),
        __v: 1
    },
    {
        _id: ObjectId('68a1fc62769d7c89006a3647'),
        title: 'Spiral Matrix',
        difficulty: 1600,
        description: 'Given an `m x n` matrix, return all elements of the matrix in spiral order.\r\n\r\nFor example, given `[[1,2,3],[4,5,6],[7,8,9]]`, the spiral order is `[1,2,3,6,9,8,7,4,5]`.',
        memoryLimit: 256,
        timeLimit: 1,
        inputFormat: 'The input will be a series of lines, where each line represents a row of the matrix. The numbers in each line are space-separated.',
        outputFormat: 'Output a single line containing space-separated integers representing the elements in spiral order.',
        sampleTestcases: [
            { input: '1 2 3\n4 5 6\n7 8 9', output: '1 2 3 6 9 8 7 4 5' },
            { input: '1 2 3 4\n5 6 7 8\n9 10 11 12', output: '1 2 3 4 8 12 11 10 9 5 6 7' }
        ],
        constraints: 'm == matrix.length\r\nn == matrix[i].length\r\n1 <= m, n <= 10\r\n-100 <= matrix[i][j] <= 100',
        tags: ['"array', 'matrix', 'simulation"'],
        submission: [],
        author: ObjectId('68ac7d7e56208746693283a0'),
        editorial: '## Approach\r\nSimulate the traversal using four boundary pointers processed layer by layer.\r\n\r\n### Boundary-Pointer Simulation\r\n1.  **Initialize:** `top=0`, `bottom=rows-1`, `left=0`, `right=cols-1`.\r\n2.  **Loop** while `top <= bottom && left <= right`.\r\n3.  **Traverse** Right → Down → Left (if `top<=bottom`) → Up (if `left<=right`), shrinking boundaries after each pass.\r\n\r\n### Complexity\r\n* **Time Complexity:** O(m * n)\r\n* **Space Complexity:** O(1) excluding output',
        editorialLink: 'https://m.youtube.com/watch?v=aqVW8IuXUF0',
        solution: '#include <iostream>\r\n#include <vector>\r\n#include <string>\r\n#include <sstream>\r\n\r\nstd::vector<int> spiralOrder(std::vector<std::vector<int>>& matrix) {\r\n    std::vector<int> result;\r\n    if (matrix.empty() || matrix[0].empty()) return result;\r\n    int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;\r\n    while (top <= bottom && left <= right) {\r\n        for (int i = left; i <= right; ++i) result.push_back(matrix[top][i]);\r\n        top++;\r\n        for (int i = top; i <= bottom; ++i) result.push_back(matrix[i][right]);\r\n        right--;\r\n        if (top <= bottom) {\r\n            for (int i = right; i >= left; --i) result.push_back(matrix[bottom][i]);\r\n            bottom--;\r\n        }\r\n        if (left <= right) {\r\n            for (int i = bottom; i >= top; --i) result.push_back(matrix[i][left]);\r\n            left++;\r\n        }\r\n    }\r\n    return result;\r\n}\r\n\r\nint main() {\r\n    std::vector<std::vector<int>> matrix;\r\n    std::string line;\r\n    while (std::getline(std::cin, line) && !line.empty()) {\r\n        std::stringstream ss(line);\r\n        std::vector<int> row;\r\n        int num;\r\n        while (ss >> num) row.push_back(num);\r\n        if (!row.empty()) matrix.push_back(row);\r\n    }\r\n    std::vector<int> spiral = spiralOrder(matrix);\r\n    for (size_t i = 0; i < spiral.size(); ++i)\r\n        std::cout << spiral[i] << (i == spiral.size() - 1 ? "" : " ");\r\n    std::cout << std::endl;\r\n    return 0;\r\n}',
        hints: [
            { title: 'Hint 1: Visualizing the Spiral', content: 'Try tracing the path of a spiral manually on a small example matrix. Notice how the traversal changes direction at the edges. Can you identify a pattern in how the row and column indices change?' },
            { title: 'Hint 2: Layer-by-Layer Processing', content: 'Think about processing the matrix in layers — start from the outermost layer and work inward. How can you define the boundaries of each layer?' },
            { title: 'Hint 3: Simulating the Movement', content: 'Use four variables — top, bottom, left, right — to track the current layer boundaries. Increment/decrement them appropriately as you traverse each side.' },
            { title: 'Hint 4: Iteration and Direction Control', content: 'Implement a loop iterating layer by layer. Track the current direction (right, down, left, up) and change it when you reach a boundary.' },
            { title: 'Hint 5: Key Observation: Boundary Conditions', content: 'After each directional pass, shrink the corresponding boundary. Be careful with the checks before the Left and Up passes to avoid double-counting rows/columns in non-square matrices.' }
        ],
        createdAt: new Date('2025-08-17T15:59:30.186Z'),
        updatedAt: new Date('2025-08-19T13:32:06.047Z'),
        __v: 1
    }
]);

print('✅ Inserted 7 problems with original IDs successfully.');