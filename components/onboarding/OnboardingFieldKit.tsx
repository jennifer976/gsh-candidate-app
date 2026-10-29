import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState, type ReactNode } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, fontFamily } from "@/lib/theme";

export function FieldLabel({
  children,
  required,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Text style={styles.label}>
      {children}
      {required ? " *" : ""}
    </Text>
  );
}

export function FieldHint({ children }: { children: string }) {
  return <Text style={styles.hint}>{children}</Text>;
}

export function TextField({
  label,
  required,
  hint,
  value,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize = "sentences",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "numeric" | "number-pad" | "url" | "phone-pad";
  autoCapitalize?: "none" | "sentences" | "characters" | "words";
}) {
  return (
    <View style={styles.field}>
      <FieldLabel required={required}>{label}</FieldLabel>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <TextInput
        accessibilityLabel={required ? `${label} required` : label}
        style={[styles.input, multiline && styles.multiline]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        multiline={multiline}
        textAlignVertical={multiline ? "top" : "center"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

export function SwitchRow({
  label,
  value,
  onValueChange,
  disabled,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchText}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        value={value}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: "#d5dae6", true: colors.navy }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export function OptionList({
  options,
  value,
  onChange,
  multiple = false,
  labels,
}: {
  options: readonly string[];
  value: string[];
  onChange: (next: string[]) => void;
  multiple?: boolean;
  labels?: Record<string, string>;
}) {
  return (
    <View style={styles.optionList}>
      {options.map((option) => {
        const selected = value.includes(option);
        const title = labels?.[option] ?? option;
        return (
          <Pressable
            key={option}
            accessibilityRole={multiple ? "checkbox" : "radio"}
            accessibilityState={{ checked: selected }}
            accessibilityLabel={title}
            onPress={() => {
              if (multiple) {
                onChange(
                  selected
                    ? value.filter((item) => item !== option)
                    : [...value, option],
                );
                return;
              }
              onChange([option]);
            }}
            style={[styles.optionRow, selected && styles.optionRowOn]}
          >
            <Text
              style={[styles.optionText, selected && styles.optionTextOn]}
              numberOfLines={2}
            >
              {title}
            </Text>
            <View
              style={[
                multiple ? styles.checkSquare : styles.checkCircle,
                selected && styles.checkOn,
              ]}
            >
              {selected ? (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              ) : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

export function SelectedPills({
  items,
  onRemove,
  renderLabel,
}: {
  items: readonly string[];
  onRemove: (item: string) => void;
  renderLabel?: (item: string) => ReactNode;
}) {
  if (!items.length) return null;
  return (
    <View style={styles.pills}>
      {items.map((item) => (
        <Pressable
          key={item}
          onPress={() => onRemove(item)}
          style={styles.pill}
          accessibilityRole="button"
          accessibilityLabel={`Remove ${item}`}
        >
          {renderLabel ? (
            renderLabel(item)
          ) : (
            <Text style={styles.pillText}>{item}</Text>
          )}
          <Ionicons name="close" size={14} color={colors.navy} />
        </Pressable>
      ))}
    </View>
  );
}

export function TagInput({
  label,
  hint,
  placeholder,
  values,
  onChange,
  max = 50,
}: {
  label: string;
  hint?: string;
  placeholder?: string;
  values: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const next = draft.trim();
    if (!next) return;
    if (values.some((v) => v.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }
    if (values.length >= max) return;
    onChange([...values, next]);
    setDraft("");
  };
  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      {hint ? <FieldHint>{hint}</FieldHint> : null}
      <SelectedPills
        items={values}
        onRemove={(item) => onChange(values.filter((v) => v !== item))}
      />
      <TextInput
        accessibilityLabel={label}
        style={styles.input}
        value={draft}
        onChangeText={setDraft}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onSubmitEditing={add}
        returnKeyType="done"
      />
      {draft.trim() ? (
        <Pressable
          onPress={add}
          style={styles.addLink}
          accessibilityRole="button"
          accessibilityLabel={`Add ${draft.trim()}`}
        >
          <Text style={styles.addLinkText}>Add</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ListPickerField({
  label,
  placeholder,
  options,
  selected,
  onToggle,
  multiple = false,
  searchPlaceholder = "Search",
}: {
  label: string;
  placeholder: string;
  options: readonly string[];
  selected: readonly string[];
  onToggle: (option: string) => void;
  multiple?: boolean;
  searchPlaceholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) => option.toLowerCase().includes(q));
  }, [options, search]);

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <SelectedPills
        items={selected}
        onRemove={(item) => onToggle(item)}
      />
      <Pressable
        style={styles.pickerBtn}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text
          style={[
            styles.pickerBtnText,
            selected.length > 0 && styles.pickerBtnTextOn,
          ]}
          numberOfLines={1}
        >
          {selected.length
            ? multiple
              ? `${selected.length} selected`
              : selected[0]
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.navy} />
      </Pressable>
      <Modal
        visible={open}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setOpen(false)}
      >
        <SafeAreaView style={styles.modalSafe} edges={["top"]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{label}</Text>
            <Pressable
              onPress={() => {
                setSearch("");
                setOpen(false);
              }}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Done"
            >
              <Text style={styles.modalDone}>Done</Text>
            </Pressable>
          </View>
          <View style={styles.modalSearch}>
            <Ionicons name="search" size={18} color={colors.textMuted} />
            <TextInput
              style={styles.modalSearchInput}
              value={search}
              onChangeText={setSearch}
              placeholder={searchPlaceholder}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>
          <FlatList
            data={filtered as string[]}
            keyExtractor={(item) => item}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const on = selected.includes(item);
              return (
                <Pressable
                  style={[styles.skillRow, on && styles.skillRowOn]}
                  onPress={() => {
                    onToggle(item);
                    if (!multiple) {
                      setSearch("");
                      setOpen(false);
                    }
                  }}
                  accessibilityRole={multiple ? "checkbox" : "radio"}
                  accessibilityState={{ checked: on }}
                >
                  <Text
                    style={[styles.skillRowText, on && styles.skillRowTextOn]}
                  >
                    {item}
                  </Text>
                  {on ? (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={colors.navy}
                    />
                  ) : (
                    <View style={styles.skillRowCircle} />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>No matches.</Text>
            }
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

export function AddBlockButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={styles.addBlock}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Ionicons name="add" size={18} color={colors.navy} />
      <Text style={styles.addBlockText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
  },
  hint: {
    fontFamily: fontFamily.regular,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text2,
  },
  input: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.navy,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  multiline: { minHeight: 120, paddingTop: 14 },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minHeight: 52,
  },
  switchText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 21,
    color: colors.navy,
  },
  optionList: { gap: 10 },
  optionRow: {
    minHeight: 56,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.white,
  },
  optionRowOn: {
    borderWidth: 2,
    borderColor: colors.navy,
  },
  optionText: {
    flex: 1,
    fontFamily: fontFamily.medium,
    fontSize: 15,
    lineHeight: 20,
    color: colors.navy,
  },
  optionTextOn: { fontFamily: fontFamily.semiBold },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  checkSquare: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: "center",
    justifyContent: "center",
  },
  checkOn: {
    backgroundColor: colors.navy,
    borderColor: colors.navy,
  },
  pills: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: colors.panel,
  },
  pillText: {
    fontFamily: fontFamily.medium,
    fontSize: 13,
    color: colors.navy,
  },
  addLink: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center" },
  addLinkText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 14,
    color: colors.navy,
    textDecorationLine: "underline",
  },
  pickerBtn: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  pickerBtnText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.textMuted,
  },
  pickerBtnTextOn: { color: colors.navy },
  modalSafe: { flex: 1, backgroundColor: colors.white },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalTitle: {
    fontFamily: fontFamily.headingStrong,
    fontSize: 20,
    color: colors.navy,
  },
  modalDone: {
    fontFamily: fontFamily.semiBold,
    fontSize: 16,
    color: colors.navy,
  },
  modalSearch: {
    marginHorizontal: 20,
    marginBottom: 8,
    minHeight: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  modalSearchInput: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.navy,
    paddingVertical: 10,
  },
  skillRow: {
    minHeight: 52,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  skillRowOn: { backgroundColor: colors.panel },
  skillRowText: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: 16,
    color: colors.navy,
  },
  skillRowTextOn: { fontFamily: fontFamily.semiBold },
  skillRowCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
  },
  empty: {
    padding: 16,
    fontFamily: fontFamily.regular,
    fontSize: 14,
    color: colors.text2,
  },
  addBlock: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: "dashed",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addBlockText: {
    fontFamily: fontFamily.semiBold,
    fontSize: 15,
    color: colors.navy,
  },
});
