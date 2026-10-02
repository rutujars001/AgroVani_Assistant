import { FarmTransaction } from '../types';

const STORAGE_KEY_TRANSACTIONS = 'agrovani_farm_transactions';

const DEFAULT_TRANSACTIONS: FarmTransaction[] = [
  {
    id: 'tx-1',
    date: '२८ सप्टेंबर २०२६',
    type: 'expense',
    crop: 'डाळिंब',
    category: 'खते',
    amount: 3200,
    note: '०:५२:३४ आणि बोरॉन विद्राव्य खत खरेदी (२ बॅग)',
    audioTranscript: 'डाळिंबासाठी खत घेतले ३२०० रुपये'
  },
  {
    id: 'tx-2',
    date: '२९ सप्टेंबर २०२६',
    type: 'expense',
    crop: 'कांदा',
    category: 'मजुरी',
    amount: 2400,
    note: 'कांदा शेतात खुरपणी व कोळपणी मजुरी (४ मजूर)',
    audioTranscript: 'कांदा खुरपणी मजुरी दिली २४०० रुपये'
  },
  {
    id: 'tx-3',
    date: '३० सप्टेंबर २०२६',
    type: 'expense',
    crop: 'डाळिंब',
    category: 'कीटकनाशके',
    amount: 1850,
    note: 'तेल्या प्रतिबंधक कॉपर ऑक्सिक्लोराईड व स्ट्रेप्टोसायक्लिन फवारणी औषध',
    audioTranscript: 'डाळिंब फवारणी औषध १८५० रुपये'
  },
  {
    id: 'tx-4',
    date: '०१ ऑक्टोबर २०२६',
    type: 'income',
    crop: 'कांदा',
    category: 'उत्पन्न / विक्री',
    amount: 48500,
    note: 'सोलापूर APMC मध्ये २० क्विंटल कांदा विक्री (₹२,४२५ प्रति क्विंटल)',
    audioTranscript: 'सोलापूर मार्केटमध्ये कांदा विकला ४८५०० रुपये आले'
  },
  {
    id: 'tx-5',
    date: '०२ ऑक्टोबर २०२६',
    type: 'expense',
    crop: 'ऊस',
    category: 'सिंचन व डिझेल',
    amount: 1200,
    note: 'विहिरीच्या पंपाचे डिझेल व ठिबक पाईप दुरुस्ती',
    audioTranscript: 'पंपाचे डिझेल १२०० रुपये'
  }
];

class FarmFinanceService {
  // Get all transactions
  getTransactions(): FarmTransaction[] {
    if (typeof window === 'undefined') return DEFAULT_TRANSACTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TRANSACTIONS);
      if (!stored) {
        this.saveTransactions(DEFAULT_TRANSACTIONS);
        return DEFAULT_TRANSACTIONS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_TRANSACTIONS;
    }
  }

  // Save transactions to local storage
  saveTransactions(transactions: FarmTransaction[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch {}
  }

  // Add a new transaction
  addTransaction(tx: Omit<FarmTransaction, 'id'>): FarmTransaction {
    const list = this.getTransactions();
    const newTx: FarmTransaction = {
      ...tx,
      id: `tx-${Date.now()}`
    };
    const updated = [newTx, ...list];
    this.saveTransactions(updated);
    return newTx;
  }

  // Delete transaction
  deleteTransaction(id: string): void {
    const list = this.getTransactions().filter((t) => t.id !== id);
    this.saveTransactions(list);
  }

  // Calculate overall financial stats
  getFinancialSummary(filterCrop?: string): {
    totalIncome: number;
    totalExpense: number;
    netProfit: number;
    profitMargin: number;
    cropBreakdown: { crop: string; expense: number; income: number; profit: number }[];
    categoryBreakdown: { category: string; amount: number; percentage: number }[];
  } {
    const all = this.getTransactions();
    const transactions = filterCrop && filterCrop !== 'all'
      ? all.filter((t) => t.crop === filterCrop)
      : all;

    let totalIncome = 0;
    let totalExpense = 0;
    const cropMap: Record<string, { expense: number; income: number }> = {};
    const categoryMap: Record<string, number> = {};

    transactions.forEach((tx) => {
      if (!cropMap[tx.crop]) {
        cropMap[tx.crop] = { expense: 0, income: 0 };
      }

      if (tx.type === 'income') {
        totalIncome += tx.amount;
        cropMap[tx.crop].income += tx.amount;
      } else {
        totalExpense += tx.amount;
        cropMap[tx.crop].expense += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    });

    const netProfit = totalIncome - totalExpense;
    const profitMargin = totalIncome > 0 ? Math.round((netProfit / totalIncome) * 100) : 0;

    const cropBreakdown = Object.entries(cropMap).map(([crop, val]) => ({
      crop,
      expense: val.expense,
      income: val.income,
      profit: val.income - val.expense
    }));

    const categoryBreakdown = Object.entries(categoryMap).map(([cat, amt]) => ({
      category: cat,
      amount: amt,
      percentage: totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0
    })).sort((a, b) => b.amount - a.amount);

    return {
      totalIncome,
      totalExpense,
      netProfit,
      profitMargin,
      cropBreakdown,
      categoryBreakdown
    };
  }

  // Parse natural spoken Marathi speech into a structured transaction
  parseSpokenExpense(transcript: string): Partial<FarmTransaction> | null {
    const text = transcript.toLowerCase();

    // 1. Detect Amount (Devanagari or standard digits)
    const digitsMap: Record<string, string> = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    let normalized = text;
    Object.entries(digitsMap).forEach(([dev, eng]) => {
      normalized = normalized.replaceAll(dev, eng);
    });

    const matchAmount = normalized.match(/(\d+)/);
    const amount = matchAmount ? parseInt(matchAmount[1], 10) : 1000;

    // 2. Detect Type (Income vs Expense)
    const isIncome = text.includes('विकला') || text.includes('विकले') || text.includes('मिळाले') ||
      text.includes('जमा') || text.includes('उत्पन्न') || text.includes('पैसे आले');
    const type: 'income' | 'expense' = isIncome ? 'income' : 'expense';

    // 3. Detect Crop
    let crop = 'इतर';
    if (text.includes('डाळिंब')) crop = 'डाळिंब';
    else if (text.includes('कांदा')) crop = 'कांदा';
    else if (text.includes('ऊस')) crop = 'ऊस';
    else if (text.includes('ज्वारी')) crop = 'ज्वारी';
    else if (text.includes('कापूस')) crop = 'कापूस';
    else if (text.includes('टोमॅटो')) crop = 'टोमॅटो';
    else if (text.includes('तूर')) crop = 'तूर';

    // 4. Detect Category
    let category: FarmTransaction['category'] = 'खते';
    if (isIncome) {
      category = 'उत्पन्न / विक्री';
    } else if (text.includes('मजुरी') || text.includes('मजूर') || text.includes('खुरपणी') || text.includes('हजेरी')) {
      category = 'मजुरी';
    } else if (text.includes('खत') || text.includes('युरिया') || text.includes('डीएपी') || text.includes('पोटॅश')) {
      category = 'खते';
    } else if (text.includes('औषध') || text.includes('फवारणी') || text.includes('कीटकनाशक')) {
      category = 'कीटकनाशके';
    } else if (text.includes('बियाणे') || text.includes('रोप') || text.includes('बेणे')) {
      category = 'बियाणे';
    } else if (text.includes('डिझेल') || text.includes('पाणी') || text.includes('मोटार') || text.includes('लाईट बिल')) {
      category = 'सिंचन व डिझेल';
    } else if (text.includes('ट्रॅक्टर') || text.includes('नांगरट') || text.includes('रोटावेटर')) {
      category = 'यंत्रसामग्री';
    }

    const todayStr = new Date().toLocaleDateString('mr-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    return {
      date: todayStr,
      type,
      crop,
      category,
      amount,
      note: transcript,
      audioTranscript: transcript
    };
  }

  // Parse compound spoken statements (e.g. "खताचे १२०० आणि मजुरीचे ८००")
  parseMultipleSpokenExpenses(transcript: string): Partial<FarmTransaction>[] {
    const parts = transcript.split(/आणि|तसेच|व|,/);
    if (parts.length > 1) {
      const results: Partial<FarmTransaction>[] = [];
      parts.forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) {
          const parsed = this.parseSpokenExpense(trimmed);
          if (parsed && parsed.amount) {
            results.push(parsed);
          }
        }
      });
      if (results.length > 0) return results;
    }

    const single = this.parseSpokenExpense(transcript);
    return single ? [single] : [];
  }
}

export const farmFinanceService = new FarmFinanceService();
