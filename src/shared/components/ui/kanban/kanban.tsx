import React, { useState } from 'react';
import type { KanbanProps } from './kanban.types';
import styles from './kanban.module.scss';

export function Kanban<T = any>({
  columns,
  data,
  columnKey,
  idKey = 'id' as keyof T,
  onCardMove,
  renderCard,
  renderHeader,
  onCardClick,
  emptyColumnPlaceholder,
  className = '',
  columnClassName = '',
  cardClassName = '',
}: KanbanProps<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null);
  const [draggedFromColumn, setDraggedFromColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Helper to get column ID for an item
  const getItemColumnId = (item: T): string => {
    if (typeof columnKey === 'function') {
      return columnKey(item);
    }
    return String((item as any)[columnKey]);
  };

  // Helper to get unique ID for an item
  const getItemId = (item: T, fallbackIndex: number): string | number => {
    if (typeof idKey === 'function') {
      return idKey(item);
    }
    if ((item as any)[idKey] !== undefined) {
      return (item as any)[idKey];
    }
    return fallbackIndex;
  };

  // Drag event handlers
  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    item: T,
    columnId: string,
  ) => {
    setDraggedItem(item);
    setDraggedFromColumn(columnId);
    e.dataTransfer.setData('text/plain', String(getItemId(item, 0)));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnId) {
      setDragOverColumn(columnId);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    // Only clear if leaving the column element itself
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    if (dragOverColumn === columnId) {
      setDragOverColumn(null);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault();
    setDragOverColumn(null);

    if (!draggedItem || !draggedFromColumn) return;

    if (draggedFromColumn !== targetColumnId) {
      onCardMove?.(draggedItem, targetColumnId, draggedFromColumn);
    }

    setDraggedItem(null);
    setDraggedFromColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDraggedFromColumn(null);
    setDragOverColumn(null);
  };

  // Default card template matching the reference design
  const renderDefaultCard = (item: any) => {
    const name = item.customerName || item.name || item.title || 'Unknown';
    const phone = item.phone || item.whatsappNumber;
    const amount = item.billAmount ?? item.amount;
    const location = item.state || item.city || '';

    return (
      <div className={styles.cardContent}>
        {/* Row 1: Name + WhatsApp + Delete */}
        <div className={styles.cardHeaderRow}>
          <div className={styles.cardTitleWrapper}>
            <span className={styles.cardTitle}>{name}</span>
            {phone && (
              <a
                href={`https://wa.me/${phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappIcon}
                title={`Chat with ${name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371s-1.041 1.017-1.041 2.479 1.066 2.876 1.214 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                </svg>
              </a>
            )}
          </div>
          {item.onDelete && (
            <button
              type="button"
              className={styles.deleteButton}
              title="Delete item"
              onClick={(e) => {
                e.stopPropagation();
                item.onDelete(item);
              }}
              aria-label="Delete"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
              </svg>
            </button>
          )}
        </div>

        {/* Row 2: Lightning icon + Monthly amount */}
        {amount !== undefined && (
          <div className={styles.cardAmountRow}>
            <span className={styles.lightningIcon}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
            </span>
            <span>₹{Number(amount).toLocaleString('en-IN')} / mo</span>
          </div>
        )}

        {/* Row 3: Location + View Details */}
        <div className={styles.cardFooterRow}>
          <div className={styles.locationWrapper}>
            <span className={styles.locationIcon}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            </span>
            <span>{location}</span>
          </div>

          <button
            type="button"
            className={styles.viewDetailsLink}
            onClick={(e) => {
              e.stopPropagation();
              item.onViewDetails?.(item);
            }}
          >
            View Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className={`${styles.kanbanBoard} ${className}`}
      tabIndex={0}
      role="region"
      aria-label="Kanban Board"
    >
      {columns.map((col) => {
        // Group items for this column (case-insensitive or exact match)
        const columnItems = data.filter((item) => {
          const itemColId = getItemColumnId(item);
          return (
            itemColId.toLowerCase() === col.id.toLowerCase() ||
            itemColId.toLowerCase() === col.title.toLowerCase()
          );
        });

        const isDragOver = dragOverColumn === col.id;

        return (
          <div
            key={col.id}
            className={`${styles.kanbanColumn} ${
              isDragOver ? styles['kanbanColumn--dragover'] : ''
            } ${columnClassName}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            {/* Column Header */}
            {renderHeader ? (
              renderHeader(col, columnItems.length)
            ) : (
              <div className={styles.columnHeader}>
                <span className={styles.columnTitle}>{col.title}</span>
                <span className={styles.columnBadge}>
                  {col.badgeCount !== undefined ? col.badgeCount : columnItems.length}
                </span>
              </div>
            )}

            {/* Cards Container */}
            <div className={styles.cardsList}>
              {columnItems.length === 0 ? (
                emptyColumnPlaceholder ? (
                  emptyColumnPlaceholder
                ) : (
                  <div className={styles.emptyColumn}>No cards</div>
                )
              ) : (
                columnItems.map((item, idx) => {
                  const itemId = getItemId(item, idx);
                  const isDraggingThis =
                    draggedItem !== null && getItemId(draggedItem, -1) === itemId;

                  return (
                    <div
                      key={String(itemId)}
                      draggable
                      onDragStart={(e) => handleDragStart(e, item, col.id)}
                      onDragEnd={handleDragEnd}
                      onClick={() => onCardClick?.(item)}
                      className={`${styles.kanbanCard} ${
                        isDraggingThis ? styles['kanbanCard--dragging'] : ''
                      } ${cardClassName}`}
                    >
                      {renderCard
                        ? renderCard(item, col, idx)
                        : renderDefaultCard(item)}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Kanban;
