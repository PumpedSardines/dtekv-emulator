// This example runs a board game program on the emulator

fn main() {
    let mut cpu = dtekv_emulator::cpu::Cpu::new();
    cpu.bus
        .load_at(0, *include_bytes!("./board_games.bin"));
    client::start(cpu);
}
