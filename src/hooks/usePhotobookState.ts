import { useState, useCallback, useEffect } from 'react';
import type { Page, PhotobookData, PhotobookState } from '@/types/photobook';

const MAX_HISTORY = 50;

export function usePhotobookState(initialData?: PhotobookData) {
  const [state, setState] = useState<PhotobookState>(() => ({
    pages: initialData?.pages || [createDefaultPage(0)],
    currentPageIndex: 0,
    history: [initialData?.pages || [createDefaultPage(0)]],
    historyIndex: 0
  }));

  // Add new page
  const addPage = useCallback((customPage?: Page) => {
    setState(prev => {
      const newPage = customPage || createDefaultPage(prev.pages.length);
      const newPages = [...prev.pages, newPage];
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), newPages].slice(-MAX_HISTORY);
      
      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        currentPageIndex: newPages.length - 1
      };
    });
  }, []);

  // Remove page
  const removePage = useCallback((index: number) => {
    setState(prev => {
      if (prev.pages.length <= 1) return prev; // Keep at least one page
      
      const newPages = prev.pages.filter((_, i) => i !== index);
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), newPages].slice(-MAX_HISTORY);
      
      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1,
        currentPageIndex: Math.min(prev.currentPageIndex, newPages.length - 1)
      };
    });
  }, []);

  // Update specific page
  const updatePage = useCallback((index: number, updatedPage: Page) => {
    setState(prev => {
      const newPages = [...prev.pages];
      newPages[index] = updatedPage;
      const newHistory = [...prev.history.slice(0, prev.historyIndex + 1), newPages].slice(-MAX_HISTORY);
      
      return {
        ...prev,
        pages: newPages,
        history: newHistory,
        historyIndex: newHistory.length - 1
      };
    });
  }, []);

  // Set current page
  const setCurrentPage = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      currentPageIndex: Math.max(0, Math.min(index, prev.pages.length - 1))
    }));
  }, []);

  // Undo
  const undo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex <= 0) return prev;
      
      return {
        ...prev,
        pages: prev.history[prev.historyIndex - 1],
        historyIndex: prev.historyIndex - 1
      };
    });
  }, []);

  // Redo
  const redo = useCallback(() => {
    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;
      
      return {
        ...prev,
        pages: prev.history[prev.historyIndex + 1],
        historyIndex: prev.historyIndex + 1
      };
    });
  }, []);

  // Can undo/redo
  const canUndo = state.historyIndex > 0;
  const canRedo = state.historyIndex < state.history.length - 1;

  // Save state
  const saveState = useCallback(() => {
    return {
      pages: state.pages,
      currentPageIndex: state.currentPageIndex
    };
  }, [state]);

  // Load state
  const loadState = useCallback((savedState: { pages: Page[]; currentPageIndex: number }) => {
    setState(prev => ({
      ...prev,
      pages: savedState.pages,
      currentPageIndex: savedState.currentPageIndex,
      history: [savedState.pages],
      historyIndex: 0
    }));
  }, []);

  return {
    pages: state.pages,
    currentPageIndex: state.currentPageIndex,
    history: state.history,
    historyIndex: state.historyIndex,
    addPage,
    removePage,
    updatePage,
    setCurrentPage,
    undo,
    redo,
    canUndo,
    canRedo,
    saveState,
    loadState
  };
}

// Helper function to create a default page
function createDefaultPage(pageNumber: number): Page {
  return {
    id: `page_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    template: 'two-horizontal',
    pageNumber,
    backgroundColor: '#ffffff',
    padding: '40px',
    gridColumns: 2,
    gridRows: 1,
    slots: [
      { id: '1', span: { col: 1, row: 1 }, photo: null, fit: 'cover', borderRadius: '8px' },
      { id: '2', span: { col: 1, row: 1 }, photo: null, fit: 'cover', borderRadius: '8px' }
    ]
  };
}
