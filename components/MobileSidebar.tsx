// @ts-nocheck
import { SidebarComponent, type Sidebar } from "@syncfusion/ej2-react-navigations"
import { useRef } from "react"
import { Link } from "react-router"
import NavItems from "./NavItems"

const MobileSidebar = () => {
    const sidebarRef = useRef<Sidebar | null>(null)

    const toggleSidebar = () => {
        sidebarRef.current?.toggle()
    }
    return (
        <div className="mobile-sidebar wrapper">
            <header>
                <Link to='/' >
                    <img src="/assets/icons/logo.svg" alt="logo" className="size-[30px]" />
                    <h1>Tourvisto</h1>
                </Link>
                <button onClick={toggleSidebar}>
                    <img src="/assets/icons/menu.svg" alt="menu" className="size-7" />
                </button>
            </header>

            <SidebarComponent
                width={270}
                ref={sidebarRef}
                created={() => sidebarRef.current?.hide()}
                closeOnDocumentClick={true}
                type="over"
            >
                <NavItems handleClick={toggleSidebar} />
            </SidebarComponent>
        </div>
    )
}

export default MobileSidebar