import React, { useState } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Settings,
  Type,
  Hash,
  Calendar,
  List,
  CheckSquare,
  Link,
  ToggleLeft,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CustomFieldDefinition, CustomFieldType, Category } from '../types';

export const CategoryFieldEditorModal: React.FC = () => {
  const {
    editingCategoryForFields,
    closeFieldEditor,
    updateCategoryFields,
    t,
  } = useApp();

  const [isAddingField, setIsAddingField] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Field form state
  const [fieldName, setFieldName] = useState('');
  const [fieldType, setFieldType] = useState<CustomFieldType>('text');
  const [fieldUnit, setFieldUnit] = useState('');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldOptionsText, setFieldOptionsText] = useState(''); // comma or newline separated

  if (!editingCategoryForFields) return null;

  const currentCategory = editingCategoryForFields;
  const fields = currentCategory.fields || [];

  const getFieldTypeIcon = (type: CustomFieldType) => {
    switch (type) {
      case 'text':
        return Type;
      case 'number':
        return Hash;
      case 'date':
        return Calendar;
      case 'select':
        return List;
      case 'multiSelect':
        return CheckSquare;
      case 'url':
        return Link;
      case 'boolean':
        return ToggleLeft;
      default:
        return Type;
    }
  };

  const resetForm = () => {
    setFieldName('');
    setFieldType('text');
    setFieldUnit('');
    setFieldPlaceholder('');
    setFieldOptionsText('');
    setIsAddingField(false);
    setEditingFieldId(null);
  };

  const startEditField = (f: CustomFieldDefinition) => {
    setEditingFieldId(f.id);
    setFieldName(f.name);
    setFieldType(f.type);
    setFieldUnit(f.unit || '');
    setFieldPlaceholder(f.placeholder || '');
    setFieldOptionsText((f.options || []).join('\n'));
    setIsAddingField(true);
  };

  const handleSaveField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName.trim()) return;

    const parsedOptions =
      fieldType === 'select' || fieldType === 'multiSelect'
        ? fieldOptionsText
            .split(/[\n,]+/)
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
        : undefined;

    let updatedFields: CustomFieldDefinition[];

    if (editingFieldId) {
      // Update existing
      updatedFields = fields.map((f) =>
        f.id === editingFieldId
          ? {
              ...f,
              name: fieldName.trim(),
              type: fieldType,
              unit: fieldUnit.trim() || undefined,
              placeholder: fieldPlaceholder.trim() || undefined,
              options: parsedOptions,
            }
          : f
      );
    } else {
      // Add new
      const newField: CustomFieldDefinition = {
        id: `f_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: fieldName.trim(),
        type: fieldType,
        unit: fieldUnit.trim() || undefined,
        placeholder: fieldPlaceholder.trim() || undefined,
        options: parsedOptions,
      };
      updatedFields = [...fields, newField];
    }

    await updateCategoryFields(currentCategory.id, updatedFields);
    resetForm();
  };

  const handleDeleteField = async (fieldId: string, name: string) => {
    if (window.confirm(`確定要刪除欄位「${name}」嗎？\n請放心：既有藏品已輸入之資料仍會完整保留在記錄中，不會遺失。`)) {
      const updatedFields = fields.filter((f) => f.id !== fieldId);
      await updateCategoryFields(currentCategory.id, updatedFields);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
    >
      {/* Backdrop */}
      <div
        onClick={closeFieldEditor}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] shadow-2xl overflow-hidden animate-scaleUp">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-[#B85D19] dark:text-[#D77937]" />
              <h2 className="font-serif-tc text-lg font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                管理「{currentCategory.name}」專屬欄位
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
              共 {fields.length} 個自訂欄位。修改或刪除欄位絕不會造成既有藏品資料遺失。
            </p>
          </div>

          <button
            type="button"
            onClick={closeFieldEditor}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#7E746A] hover:bg-[#E4DDD2]/60 dark:hover:bg-[#2C2824] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Add / Edit Field Section */}
          {isAddingField ? (
            <form
              onSubmit={handleSaveField}
              className="rounded-xl border border-[#B85D19]/40 dark:border-[#D77937]/40 bg-white dark:bg-[#221F1C] p-5 space-y-4 shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-[#E4DDD2] dark:border-[#38322B] pb-3">
                <span className="font-serif-tc text-sm font-bold text-[#B85D19] dark:text-[#D77937]">
                  {editingFieldId ? '編輯欄位設定' : '新增自訂欄位'}
                </span>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs text-[#7E746A] hover:text-[#2A2521] dark:hover:text-[#EDE6DE]"
                >
                  取消
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Field Name */}
                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    欄位名稱 <span className="text-[#BA3D3D]">*</span>
                  </label>
                  <input
                    type="text"
                    value={fieldName}
                    onChange={(e) => setFieldName(e.target.value)}
                    placeholder="例如：發行年份、材質、比例、作者..."
                    required
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                  />
                </div>

                {/* Field Input Method */}
                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    輸入方式 <span className="text-[#BA3D3D]">*</span>
                  </label>
                  <select
                    value={fieldType}
                    onChange={(e) => setFieldType(e.target.value as CustomFieldType)}
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden cursor-pointer"
                  >
                    <option value="text">文字</option>
                    <option value="number">數字</option>
                    <option value="date">日期</option>
                    <option value="select">單選</option>
                    <option value="multiSelect">多選</option>
                    <option value="url">網址</option>
                    <option value="boolean">是／否</option>
                  </select>
                </div>
              </div>

              {/* Extra settings for Number: Unit */}
              {fieldType === 'number' && (
                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    單位標記 (選填)
                  </label>
                  <input
                    type="text"
                    value={fieldUnit}
                    onChange={(e) => setFieldUnit(e.target.value)}
                    placeholder="例如：mm、g、克、年、卷、頁"
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                  />
                </div>
              )}

              {/* Extra settings for Select and MultiSelect: Options */}
              {(fieldType === 'select' || fieldType === 'multiSelect') && (
                <div className="space-y-1">
                  <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                    可選選項清單 <span className="text-[#BA3D3D]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={fieldOptionsText}
                    onChange={(e) => setFieldOptionsText(e.target.value)}
                    placeholder="請輸入選項，一行一個或用逗號分開&#10;例如：&#10;初版一刷&#10;初版再刷&#10;限定特裝版"
                    required
                    className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] p-3 text-xs text-[#2A2521] dark:text-[#EDE6DE] placeholder-[#7E746A]/50 focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                  />
                  <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] block">
                    輸入選項後，表單將提供對應的下拉單選或標籤多選按鈕。
                  </span>
                </div>
              )}

              {/* Placeholder */}
              <div className="space-y-1">
                <label className="font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE] block">
                  輸入提示文字 (選填)
                </label>
                <input
                  type="text"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="顯示於輸入框內的淡色提示..."
                  className="w-full rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-[#F8F5F0] dark:bg-[#1C1A17] px-3.5 py-2 text-xs text-[#2A2521] dark:text-[#EDE6DE] focus:border-[#B85D19] dark:focus:border-[#D77937] focus:outline-hidden"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-[#E4DDD2] dark:border-[#38322B] px-4 py-2 font-serif-tc text-xs font-semibold text-[#2A2521] dark:text-[#EDE6DE]"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-5 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                  <span>{editingFieldId ? '更新欄位' : '加入欄位'}</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => {
                resetForm();
                setIsAddingField(true);
              }}
              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[#B85D19]/40 dark:border-[#D77937]/40 bg-white/60 dark:bg-[#221F1C]/60 py-3 px-4 font-serif-tc text-xs font-semibold text-[#B85D19] dark:text-[#D77937] hover:bg-[#F7EFE7]/50 dark:hover:bg-[#35261C]/50 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>為「{currentCategory.name}」新增自訂欄位</span>
            </button>
          )}

          {/* Existing Fields List */}
          <div className="space-y-3">
            <span className="font-serif-tc text-xs font-semibold text-[#7E746A] dark:text-[#A3978B] uppercase tracking-wider block">
              現有專屬欄位清單 ({fields.length})
            </span>

            {fields.length === 0 ? (
              <div className="rounded-xl border border-dashed border-[#E4DDD2] dark:border-[#38322B] p-8 text-center bg-white/40 dark:bg-[#221F1C]/40">
                <p className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
                  此分類尚未建立自訂欄位，點擊上方按鈕即可快速新增。
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {fields.map((f, index) => {
                  const Icon = getFieldTypeIcon(f.type);
                  return (
                    <div
                      key={f.id}
                      className="flex items-center justify-between rounded-xl border border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] p-3.5 shadow-2xs hover:border-[#B85D19]/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#F3ECE2] dark:bg-[#2C2824] font-cinzel text-xs font-bold text-[#7E746A] dark:text-[#A3978B]">
                          {index + 1}
                        </span>
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F7EFE7] dark:bg-[#35261C] text-[#B85D19] dark:text-[#D77937]">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-serif-tc text-xs font-bold text-[#2A2521] dark:text-[#EDE6DE]">
                              {f.name}
                            </span>
                            {f.unit && (
                              <span className="rounded bg-[#F3ECE2] dark:bg-[#2C2824] px-1.5 py-0.2 text-[10px] text-[#7E746A] dark:text-[#A3978B]">
                                單位: {f.unit}
                              </span>
                            )}
                          </div>
                          {(f.options && f.options.length > 0) || f.placeholder ? (
                            <div className="flex items-center gap-2 mt-0.5">
                              {f.options && f.options.length > 0 && (
                                <span className="text-[11px] text-[#B85D19] dark:text-[#D77937]">
                                  {f.options.length} 個預設選項
                                </span>
                              )}
                              {f.placeholder && (
                                <span className="text-[11px] text-[#7E746A] dark:text-[#A3978B] truncate max-w-[200px]">
                                  提示：{f.placeholder}
                                </span>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="編輯此欄位"
                          onClick={() => startEditField(f)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4DDD2] dark:border-[#38322B] text-[#7E746A] hover:text-[#B85D19] hover:bg-[#F8F5F0] dark:hover:bg-[#2C2824] transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          title="刪除此欄位"
                          onClick={() => handleDeleteField(f.id, f.name)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#E4DDD2] dark:border-[#38322B] text-[#7E746A] hover:text-[#BA3D3D] hover:border-[#BA3D3D] hover:bg-[#FDF1F1] dark:hover:bg-[#382020] transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#E4DDD2] dark:border-[#38322B] bg-white dark:bg-[#221F1C] px-6 py-4">
          <span className="text-xs text-[#7E746A] dark:text-[#A3978B] font-serif-tc">
            已自動同步至分類定義
          </span>

          <button
            type="button"
            onClick={closeFieldEditor}
            className="inline-flex items-center justify-center rounded-xl bg-[#B85D19] hover:bg-[#9E4E13] dark:bg-[#D77937] dark:hover:bg-[#E88949] px-6 py-2 font-serif-tc text-xs font-semibold text-white shadow-xs transition-colors"
          >
            完成並返回
          </button>
        </div>
      </div>
    </div>
  );
};
