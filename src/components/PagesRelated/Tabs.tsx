'use client'

// Types
import { TabsProps } from '@/src/types/props.type'
// Style
import '@/src/styles/components/PagesRelated/Tabs.css'

export default function Tabs<T extends string>({
    tabs,
    activeTab,
    onChangeAction,
}: TabsProps<T>) {
    return (
        <div className='tabs-nav-container'>
            {tabs.map((tab) => {
                const TabIcon = tab.Icon
                const isActive = activeTab === tab.key

                return (
                    <button
                        key={tab.key}
                        type='button'
                        onClick={() => onChangeAction(tab.key)}
                        className={`tab-nav-btn ${isActive ? 'active-tab' : ''}`}
                    >
                        {TabIcon && <TabIcon className='tab-icon' />}
                        <span>{tab.label}</span>
                    </button>
                )
            })}
        </div>
    )
}
