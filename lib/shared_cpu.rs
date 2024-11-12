use dtekv_emulator::{cpu::Cpu, io::Vga};
use std::{
    alloc::{alloc, dealloc, Layout},
    ptr,
    sync::atomic::{AtomicBool, Ordering},
};

/// A wrapper around the CPU that allows for shared vga access
#[derive(Debug)]
pub struct SharedCpu {
    ptr: *mut u8,
    lock: AtomicBool,
}

unsafe impl Sync for SharedCpu {}
unsafe impl Send for SharedCpu {}

// This is thread safe due to two reasons:
//
// 1. The VGA struct is not mutable and we don't care about locking it while reading from it, we
//    can't get invalid VGA state by reading from it.
// 2. get_cpu can only have one active mutable reference at a time, so we can't have two threads
//    with mutable access to the CPU at the same time.
//
// This can whole struct could've been circumvented by using Mutex<Cpu>, however this would lock
// the cpu thread while sending the VGA image, which slows down the emulator a lot.
//
// The behavior this is emulating is in essence contrary to Rust goals, that's why we need to use
// unsafe here
//
// IMPORTANT: Only VGA is thread safe, no other io devices. THIS IS IMPORTANT!!! Don't add more IO
// devices here in the future unless you make them thread safe
impl SharedCpu {
    pub fn new(cpu: Cpu) -> Self {
        let layout = Layout::new::<Cpu>();
        let ptr = unsafe {
            let ptr = alloc(layout);
            ptr::write(ptr as *mut Cpu, cpu);
            ptr
        };

        SharedCpu {
            ptr,
            lock: AtomicBool::new(false),
        }
    }

    pub fn get_vga(&self) -> &Vga {
        unsafe {
            let cpu = &*(self.ptr as *const Cpu);
            let vga = &cpu.bus.vga as *const Vga;
            &*vga
        }
    }

    pub fn get_cpu(&self) -> Result<&mut Cpu, ()> {
        let res = self
            .lock
            .compare_exchange(false, true, Ordering::Relaxed, Ordering::Relaxed);
        if res.is_ok() {
            Ok(unsafe { &mut *(self.ptr as *mut Cpu) })
        } else {
            Err(())
        }
    }
}

impl Drop for SharedCpu {
    fn drop(&mut self) {
        unsafe {
            let layout = Layout::new::<Cpu>();
            ptr::drop_in_place(self.ptr as *mut Cpu);
            dealloc(self.ptr, layout);
        }
    }
}
